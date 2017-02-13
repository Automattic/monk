/*
 * Module dependencies.
 */

var mongo = require('mongodb')
var Debug = require('debug')
var monkDebug = Debug('monk:manager')
var Collection = require('./collection')
var ObjectId = mongo.ObjectID
var MongoClient = mongo.MongoClient
var Logger = mongo.Logger
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits

/*
 * Logger
 */
Logger.setCurrentLogger(function (msg, context) {
  if (context.type === 'error') {
    return console.error(msg)
  }
  var logger = Debug('mongo:' + context.className)
  logger.log = console.log.bind(console)
  logger(context.type.toUpperCase() + ': ' + context.message)
})
Logger.setLevel('debug') // set the level to `debug` so we have everything going through debug

var STATE = {
  CLOSED: 'closed',
  OPENING: 'opening',
  OPEN: 'open'
}

/*
 * Module exports.
 */

module.exports = Manager

/**
 * Monk constructor.
 *
 * @param {Array|String} uri replica sets can be an array or
 * comma-separated
 * @param {Object|Function} opts or connect callback
 * @param {Function} fn connect callback
 * @return {Promise} resolve when the connection is opened
 */

function Manager (uri, opts, fn) {
  if (!uri) {
    throw Error('No connection URI provided.')
  }

  if (!(this instanceof Manager)) {
    return new Manager(uri, opts, fn)
  }

  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = opts || {}

  if (Array.isArray(uri)) {
    if (!opts.database) {
      for (var i = 0, l = uri.length; i < l; i++) {
        if (!opts.database) {
          opts.database = uri[i].replace(/([^\/])+\/?/, '')
        }
        uri[i] = uri[i].replace(/\/.*/, '')
      }
    }
    uri = uri.join(',') + '/' + opts.database
    monkDebug('repl set connection "%j" to database "%s"', uri, opts.database)
  }

  if (typeof uri === 'string') {
    if (!/^mongodb:\/\//.test(uri)) {
      uri = 'mongodb://' + uri
    }
  }

  this._state = STATE.OPENING

  this._queue = []
  this.on('open', function (db) {
    monkDebug('connection opened')
    monkDebug('emptying queries queue (%s to go)', this._queue.length)
    this._queue.forEach(function (cb) {
      cb(db)
    })
  }.bind(this))

  this._connectionURI = uri
  this._connectionOptions = opts

  this.open(uri, opts, fn && function (err) {
    fn(err, this)
  }.bind(this))

  this.helper = {
    id: ObjectId
  }

  this.collections = {}
  this.options = { safe: true }

  this.open = this.open.bind(this)
  this.close = this.close.bind(this)
  this.executeWhenOpened = this.executeWhenOpened.bind(this)
  this.collection = this.col = this.get = this.get.bind(this)
  this.oid = this.id
}

/*
 * Inherits from EventEmitter.
 */

inherits(Manager, EventEmitter)

/**
 * Open the connection
 * @private
 */
Manager.prototype.open = function (uri, opts, fn) {
  MongoClient.connect(uri, opts, function (err, db) {
    if (err || !db) {
      this._state = STATE.CLOSED
      this.emit('error-opening', err)
    } else {
      this._state = STATE.OPEN
      this._db = db
      this.emit('open', db)
    }
    if (fn) {
      fn(err, this)
    }
  }.bind(this))
}

/**
 * Execute when connection opened.
 * @private
 */

Manager.prototype.executeWhenOpened = function () {
  switch (this._state) {
    case STATE.OPEN:
      return Promise.resolve(this._db)
    case STATE.OPENING:
      return new Promise(function (resolve) {
        this._queue.push(resolve)
      }.bind(this))
    case STATE.CLOSED:
    default:
      return new Promise(function (resolve) {
        this._queue.push(resolve)
        this.open(this._connectionURI, this._connectionOptions)
      }.bind(this))
  }
}

/**
 * Then
 *
 * @param {Function} [fn] - callback
 */

Manager.prototype.then = function (fn) {
  return new Promise(function (resolve, reject) {
    this.once('open', resolve)
    this.once('error-opening', reject)
  }.bind(this)).then(fn.bind(null, this))
}

/**
 * Catch
 *
 * @param {Function} [fn] - callback
 */

Manager.prototype.catch = function (fn) {
  return new Promise(function (resolve) {
    this.once('error-opening', resolve)
  }.bind(this)).then(fn.bind(null))
}

/**
 * Closes the connection.
 *
 * @param {Boolean} [force] - Force close, emitting no events
 * @param {Function} [fn] - callback
 * @return {Promise}
 */

Manager.prototype.close = function (force, fn) {
  if (typeof force === 'function') {
    fn = force
    force = false
  }

  var self = this
  function close (resolve, db) {
    db.close(force, function () {
      self._state = STATE.CLOSED
      self.emit('close')
      if (fn) {
        fn()
      }
      resolve()
    })
  }

  switch (this._state) {
    case STATE.CLOSED:
      if (fn) {
        fn()
      }
      return Promise.resolve()
    case STATE.OPENING:
      return new Promise(function (resolve) {
        self._queue.push(function (db) {
          close(resolve, db)
        })
      })
    case STATE.OPEN:
    default:
      return new Promise(function (resolve) {
        close(resolve, self._db)
      })
  }
}

/**
 * Gets a collection.
 *
 * @param {String} name - name of the mongo collection
 * @param {Object} [options] - options to pass to the collection
 * @return {Collection} collection to query against
 */

Manager.prototype.get = function (name, options) {
  if ((options || {}).cache === false || !this.collections[name]) {
    this.collections[name] = new Collection(this, name, options)
  }

  return this.collections[name]
}

/**
 * Create a collection.
 *
 * @param {String} name - name of the mongo collection
 * @param {Object} [creationOptions] - options used when creating the collection
 * @param {Object} [options] - options to pass to the collection
 * @return {Collection} collection to query against
 */

Manager.prototype.create = function (name, creationOptions, options) {
  this.executeWhenOpened().then(function (db) {
    db.createCollection(name, creationOptions)
  }).catch(function (err) {
    this.emit('error', err)
  })

  if ((options || {}).cache === false || !this.collections[name]) {
    this.collections[name] = new Collection(this, name, options)
  }

  return this.collections[name]
}

/**
 * @deprecated
 */

Manager.prototype.id = function (str) {
  console.warn('DEPRECATED (manager.id): use monk.id instead (see https://Automattic.github.io/monk/docs/id.html)')
  return require('./helpers').id(str)
}

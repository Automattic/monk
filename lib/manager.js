/*
 * Module dependencies.
 */

var mongoskin = require('mongoskin')
var debug = require('debug')('monk:manager')
var Collection = require('./collection')
var ObjectId = mongoskin.ObjectID
var EventEmitter = require('events').EventEmitter
var inherits = require('util').inherits
var util = require('./util')

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
 *
 * @example
 *
 * const db = require('monk')('localhost/mydb', options)
 *
 * @example
 *
 * const db = require('monk')('localhost/mydb,192.168.1.1') // replica set
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
  opts.safe = true

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
    debug('repl set connection "%j" to database "%s"', uri, opts.database)
  }

  if (typeof uri === 'string') {
    if (!/^mongodb:\/\//.test(uri)) {
      uri = 'mongodb://' + uri
    }
  }

  this.driver = mongoskin.db(uri, opts)
  this.helper = mongoskin.helper
  this.helper.id = ObjectId
  this.driver.open(this.onOpen.bind(this))
  this.collections = {}
  this.options = { safe: true }

  this.close = this.close.bind(this)
  this.col = this.get = this.get.bind(this)
  this.oid = this.id = this.id.bind(this)

  return new Promise(function (resolve, reject) {
    this.once('open', util.callback(resolve, reject, fn))
  }.bind(this))
}

/*
 * Inherits from EventEmitter
 */

inherits(Manager, EventEmitter)

/**
 * Open callback.
 *
 * @private
 */

Manager.prototype.onOpen = function () {
  this.emit('open')
}

/**
 * Closes the connection.
 *
 * @param {Function} {fn} - callback
 * @return {Manager} for chaining
 *
 * @example
 *
 * db.close()
 *
 */

Manager.prototype.close = function (fn) {
  this.driver.close(fn)
  return this
}

/**
 * Gets a collection.
 *
 * @param {String} name - name of the mongo collection
 * @return {Collection} collection to query against
 *
 * @example
 *
 * const users = db.get('users')
 *
 */

Manager.prototype.get = function (name) {
  if (!this.collections[name]) {
    this.collections[name] = new Collection(this, name)
  }

  return this.collections[name]
}

/**
 * Casts to objectid
 *
 * @param {Mixed} str - hex id or ObjectId
 * @return {ObjectId}
 * @api public
 */

Manager.prototype.id = function (str) {
  if (str == null) return ObjectId()
  return typeof str === 'string' ? ObjectId.createFromHexString(str) : str
}

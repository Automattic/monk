var helpers = require('./helpers')
var debug = require('debug')('monk:queries')
var objectAssign = require('object-assign')

function prePlugins (method, args, col) {
  const arg = {
    method: 'aggregate',
    helpers: helpers,
    manager: this.manager,
    collection: this,
    col: col
  }

  for (var i in (args || {})) {
    arg[i] = args[i]
  }

  this.plugins.pre.forEach(function (plugin) {
    var update = plugin(arg)
    for (var i in update) {
      arg[i] = update[i]
    }
  })

  return arg
}

function postPlugins (method, options, result) {
  return this.plugins.post.reduce(function (p, plugin) {
    return p.then(function (res) {
      plugin({
        method: 'aggregate',
        options: options,
        result: res,
        manager: this.manager,
        collection: this
      })
    }).bind(this)
  }.bind(this), Promise.resolve(result))
}

function thenFn (fn) {
  return function (res) {
    if (fn && typeof fn === 'function') {
      fn(null, res)
    }
    return res
  }
}

function catchFn (fn) {
  return function (err) {
    if (fn && typeof fn === 'function') {
      return fn(err)
    }
    throw err
  }
}

module.exports = Collection

var DEFAULT_OPTIONS = {
  castIds: true,
  wrapNon$UpdateField: true
}

var FIELDS_TO_CAST = ['operations', 'query', 'data', 'update']
var DEFAULT_PLUGINS = {
  pre: [
    require('monk-plugin-query'),
    require('monk-plugin-options'),
    require('monk-plugin-cast-ids')(FIELDS_TO_CAST),
    require('monk-plugin-fields')
  ],
  post: []
}

function Collection (manager, name, options) {
  this.manager = manager
  this.name = name
  this.options = objectAssign(DEFAULT_OPTIONS, options)
  this.plugins = {
    pre: DEFAULT_PLUGINS.pre.concat((this.options.plugins || {}).pre || []),
    post: DEFAULT_PLUGINS.post.concat((this.options.plugins || {}).post || [])
  }

  delete this.options.cache
  delete this.options.plugins

  this.oid = this.id
  this.createIndex = this.createIndex.bind(this)
  this.index = this.ensureIndex = this.ensureIndex.bind(this)
  this.dropIndex = this.dropIndex.bind(this)
  this.indexes = this.indexes.bind(this)
  this.dropIndexes = this.dropIndexes.bind(this)
  this.update = this.update.bind(this)
  this.remove = this.remove.bind(this)
  this.findOneAndUpdate = this.findOneAndUpdate.bind(this)
  this.findOneAndDelete = this.findOneAndDelete.bind(this)
  this.insert = this.insert.bind(this)
  this.find = this.find.bind(this)
  this.distinct = this.distinct.bind(this)
  this.count = this.count.bind(this)
  this.findOne = this.findOne.bind(this)
  this.aggregate = this.aggregate.bind(this)
  this.drop = this.drop.bind(this)
  this.executeWhenOpened = this.executeWhenOpened.bind(this)
}

/**
 * Execute when connection opened.
 * @private
 */

Collection.prototype.executeWhenOpened = function (fn) {
  return this.manager.executeWhenOpened().then(function (db) {
    return db.collection(this.name)
  }.bind(this))
}

Collection.prototype.aggregate = function (stages, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  debug('%s aggregate %j', this.name, stages)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'aggregate', {options: opts, stages: stages}))
  .then(function (args) {
    return args.col.aggregate(args.stages, args.options)
  }).then(function (cursor) {
    return cursor.toArray()
  }).then(postPlugins.bind(this, 'aggregate', opts)).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.bulkWrite = function (operations, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  debug('%s bulkWrite %j', this.name, operations)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'bulkWrite', {options: opts, operations: operations}))
  .then(function (args) {
    return args.col.bulkWrite(args.operations, args.options)
  }).then(postPlugins.bind(this, 'bulkWrite', opts)).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.count = function (query, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  debug('%s count %j', this.name, query)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'count', {options: opts, query: query}))
  .then(function (args) {
    return args.col.count(args.query, args.options)
  }).then(postPlugins.bind(this, 'count', opts)).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.distinct = function (field, query, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  if (typeof query === 'function') {
    fn = query
    query = {}
  }

  debug('%s distinct %s (%j)', this.name, field, query)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'distinct', {options: opts, query: query, field: field}))
  .then(function (args) {
    return args.col.distinct(args.field, args.query, args.options)
  }).then(postPlugins.bind(this, 'distinct', opts)).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.drop = function (fn) {
  debug('%s drop', this.name)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'drop', {}))
  .then(function (args) {
    return args.col.drop()
  }).catch(function (err) {
    if (err && err.message === 'ns not found') {
      return 'ns not found'
    } else {
      throw err
    }
  }).then(postPlugins.bind(this, 'drop', {})).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.dropIndex = function (fields, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  debug('%s dropIndex %j (%j)', this.name, fields, opts)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'dropIndex', {options: opts, fields: fields}))
  .then(function (args) {
    return args.col.dropIndex(args.fields, args.options)
  }).then(postPlugins.bind(this, 'dropIndex', opts)).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.dropIndexes = function (fn) {
  debug('%s dropIndexes', this.name)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'dropIndexes', {}))
  .then(function (args) {
    return args.col.dropIndexes()
  }).then(postPlugins.bind(this, 'dropIndexes', {})).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.createIndex = function (fields, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  debug('%s createIndex %j (%j)', this.name, fields, opts)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'createIndex', {options: opts, fields: fields}))
  .then(function (args) {
    return args.col.createIndex(args.fields, args.options)
  }).then(postPlugins.bind(this, 'createIndex', {options: opts})).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.ensureIndex = function (fields, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  console.warn('DEPRECATED (collection.ensureIndex): use collection.createIndex instead (see https://Automattic.github.io/monk/docs/collection/createIndex.html)')

  // query
  debug('%s ensureIndex %j (%j)', this.name, fields, opts)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'ensureIndex', {options: opts, fields: fields}))
  .then(function (args) {
    return args.col.ensureIndex(args.fields, args.opts)
  }).then(postPlugins.bind(this, 'ensureIndex', {options: opts})).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.find = function (query, opts, fn) {
  var self = this

  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  debug('%s find %j', this.name, query)

  if ((opts || {}).rawCursor) {
    delete opts.rawCursor
    return this.executeWhenOpened().then(prePlugins.bind(this, 'find', {options: opts, query: query}))
    .then(function (args) {
      return args.col.find(args.query, args.options)
    }).then(postPlugins.bind(this, 'find', {options: opts})).then(thenFn(fn)).catch(catchFn(fn))
  }

  var promise = this.executeWhenOpened().then(prePlugins.bind(this, 'find', {options: opts, query: query}))
  .then(function (args) {
    return args.col.find(args.query, args.options)
  }).then(function (cursor) {
    if (!(opts || {}).stream && !promise.eachListener) {
      return cursor.toArray().then(postPlugins.bind(self, 'find', {options: opts})).then(thenFn(fn)).catch(catchFn(fn))
    }

    if (typeof (opts || {}).stream === 'function') {
      promise.eachListener = (opts || {}).stream
    }

    var didClose = false
    var didFinish = false
    var processing = 0

    function close () {
      didClose = true
      processing -= 1
      cursor.close()
    }

    function pause () {
      processing += 1
      cursor.pause()
    }

    return new Promise(function (resolve, reject) {
      cursor.on('data', function (doc) {
        if (!didClose) {
          promise.eachListener(doc, {
            close: close,
            pause: pause,
            resume: resume
          })
        }
      })

      function resume () {
        processing -= 1
        cursor.resume()
        if (processing === 0 && didFinish) {
          done()
        }
      }

      function done () {
        didFinish = true
        if (processing <= 0) {
          if (fn) {
            fn()
          }
          resolve()
        }
      }

      cursor.on('close', done)
      cursor.on('end', done)

      cursor.on('error', function (err) {
        if (fn) {
          fn(err)
        }
        reject(err)
      })
    })
  })

  promise.each = function (eachListener) {
    promise.eachListener = eachListener
    return promise
  }

  return promise
}

Collection.prototype.findOne = function (query, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }
  debug('%s findOne %j', this.name, query)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'findOne', {options: opts, query: query})).then(function (args) {
    return args.col.find(args.query, args.options).limit(1).toArray()
  }).then(function (docs) {
    return (docs && docs[0]) || null
  }).then(postPlugins.bind(this, 'findOne', {options: opts})).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.findOneAndDelete = function (query, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }
  debug('%s findOneAndDelete %j with %j', this.name, query)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'findOneAndDelete', {options: opts, query: query}))
  .then(function (args) {
    return args.col.findOneAndDelete(args.query, args.options)
  }).then(function (doc) {
    return (doc && doc.value) || doc
  }).then(postPlugins.bind(this, 'findOneAndDelete', {options: opts})).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.findOneAndUpdate = function (query, update, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }
  debug('%s findOneAndUpdate %j with %j', this.name, query, update)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'findOneAndUpdate', {options: opts, query: query, update: update}))
  .then(function (args) {
    if (typeof (args.options || {}).returnOriginal === 'undefined') {
      args.options.returnOriginal = false
    }
    return args.col.findOneAndUpdate(args.query, args.update, args.options)
  }).then(function (doc) {
    return (doc && doc.value) || doc
  }).then(postPlugins.bind(this, 'findOneAndUpdate', {options: opts})).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.group = function (keys, condition, initial, reduce, finalize, command, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }
  debug('%s group %j with %j', this.name, keys, condition)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'group', {options: opts, keys: keys, condition: condition, initial: initial, reduce: reduce, finalize: finalize, command: command}))
  .then(function (args) {
    return args.col.group(args.keys, args.condition, args.initial, args.reduce, args.finalize, args.command, args.options)
  }).then(postPlugins.bind(this, 'group', {options: opts})).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.indexes = function (fn) {
  debug('%s indexInformation', this.name)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'indexes', {}))
  .then(function (args) {
    return args.col.indexInformation()
  }).then(postPlugins.bind(this, 'indexes', {})).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.insert = function (data, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  var arrayInsert = Array.isArray(data)

  if (arrayInsert && data.length === 0) {
    debug('%s inserting empty array in %j', this.name)
    return Promise.resolve([])
  }

  debug('%s insert %j', this.name, data)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'insert', {data: data, options: opts}))
  .then(function (args) {
    return args.col.insert(args.data, args.options)
  }).then(function (docs) {
    var res = (docs || {}).ops
    if (res && !arrayInsert) {
      res = docs.ops[0]
    }
    return res
  }).then(postPlugins.bind(this, 'insert', {options: opts})).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.remove = function (query, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }
  debug('%s remove %j with %j', this.name, query, opts)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'remove', {query: query, options: opts}))
  .then(function (args) {
    return args.col.remove(args.query, args.options)
  }).then(postPlugins.bind(this, 'remove', {options: opts})).then(thenFn(fn)).catch(catchFn(fn))
}

Collection.prototype.update = function (query, update, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }
  debug('%s update %j with %j', this.name, query, update)
  return this.executeWhenOpened().then(prePlugins.bind(this, 'update', {update: update, query: query, options: opts}))
  .then(function (args) {
    return args.col.update(args.query, args.update, args.options)
  }).then(function (doc) {
    return (doc && doc.result) || doc
  }).then(postPlugins.bind(this, 'update', {options: opts})).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * @deprecated
 */

Collection.prototype.id = function (str) {
  console.warn('DEPRECATED (collection.id): use monk.id instead (see https://Automattic.github.io/monk/docs/id.html)')
  return require('./helpers').id(str)
}

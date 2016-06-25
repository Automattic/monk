/**
 * Module dependencies.
 */

var util = require('./util')
var debug = require('debug')('monk:queries')
var inherits = require('util').inherits
var EventEmitter = require('events').EventEmitter

/**
 * Module exports
 */

module.exports = Collection

/**
 * Collection.
 *
 * @api public
 */

function Collection (manager, name) {
  this.manager = manager
  this.driver = manager.driver
  this.helper = manager.helper
  this.name = name
  this.col = this.driver.collection(name)
  this.col.id = this.helper.id
  this.options = {}
  this.col.emitter = this.col.emitter || this.col._emitter
  this.col.emitter.setMaxListeners(Infinity)

  this.oid = this.id = this.id.bind(this)
  this.opts = this.opts.bind(this)
  this.index = this.ensureIndex = this.ensureIndex.bind(this)
  this.dropIndex = this.dropIndex.bind(this)
  this.indexes = this.indexes.bind(this)
  this.dropIndexes = this.dropIndexes.bind(this)
  this.update = this.update.bind(this)
  this.updateById = this.updateById.bind(this)
  this.remove = this.remove.bind(this)
  this.removeById = this.removeById.bind(this)
  this.findAndModify = this.findAndModify.bind(this)
  this.insert = this.insert.bind(this)
  this.findById = this.findById.bind(this)
  this.find = this.find.bind(this)
  this.distinct = this.distinct.bind(this)
  this.count = this.count.bind(this)
  this.findOne = this.findOne.bind(this)
  this.aggregate = this.aggregate.bind(this)
  this.drop = this.drop.bind(this)
  this.cast = this.cast.bind(this)
}

/**
 * Inherits from EventEmitter.
 */

inherits(Collection, EventEmitter)

/**
 * Casts to objectid
 *
 * @param {Mixed} hex id or ObjectId
 * @return {ObjectId}
 * @api public
 */

Collection.prototype.id = function (str) {
  if (str == null) return this.col.id()
  return typeof str === 'string' ? this.col.id(str) : str
}

/**
 * Opts utility.
 */

Collection.prototype.opts = function (opts) {
  opts = util.options(opts || {})

  for (var i in this.manager.options) {
    if (!(i in opts) && !(i in this.options)) {
      opts[i] = this.manager.options[i]
    }
  }

  for (var j in this.options) {
    if (!(j in opts)) {
      opts[j] = this.options[j]
    }
  }

  return opts
}

/**
 * Set up indexes.
 *
 * @param {Object|String|Array} fields
 * @param {Object|Function} optional, options or callback
 * @param {Function} optional, callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.ensureIndex = function (fields, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  fields = util.fields(fields)
  opts = this.opts(opts)

  // query
  debug('%s ensureIndex %j (%j)', this.name, fields, opts)
  return new Promise(function (resolve, reject) {
    this.col.ensureIndex(fields, opts, util.callback(resolve, reject, fn))
  }.bind(this))
}

/**
 * Drop indexes.
 *
 * @param {Object|String|Array} fields
 * @param {Object|Function} optional, options or callback
 * @param {Function} optional, callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.dropIndex = function (fields, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  fields = util.fields(fields)
  opts = this.opts(opts)

  // query
  debug('%s dropIndex %j (%j)', this.name, fields, opts)
  return new Promise(function (resolve, reject) {
    this.col.dropIndex(fields, opts, util.callback(resolve, reject, fn))
  }.bind(this))
}

/**
 * Drop all indexes.
 *
 * @param {Object|Function} optional, options or callback
 * @param {Function} optional, callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.dropIndexes = function (fn) {
  // query
  debug('%s dropIndexes', this.name)
  return new Promise(function (resolve, reject) {
    this.col.dropIndexes(util.callback(resolve, reject, fn))
  }.bind(this))
}

/**
 * Gets all indexes.
 *
 * @param {Function} callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.indexes = function (fn) {
  debug('%s indexInformation', this.name)
  return new Promise(function (resolve, reject) {
    this.col.indexInformation(util.callback(resolve, reject, fn))
  }.bind(this))
}

/**
 * update
 *
 * @param {Object} search query
 * @param {Object} update obj
 * @param {Object|String|Array} optional, options or fields
 * @param {Function} callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.update = function (search, update, opts, fn) {
  if (typeof search === 'string' || typeof search.toHexString === 'function') {
    return this.update({ _id: search }, update, opts, fn)
  }

  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = this.opts(opts)

  // cast
  if (opts.castIds !== false) {
    search = this.cast(search)
    update = this.cast(update)
  }

  // query
  debug('%s update %j with %j', this.name, search, update)
  return new Promise(function (resolve, reject) {
    this.col.update(search, update, opts, util.callback(resolve, reject, fn, function (err, doc, next) {
      next(err, doc && doc.result || doc)
    }))
  }.bind(this))
}

/**
 * update by id helper
 *
 * @param {String|Object} object id
 * @param {Object} update obj
 * @param {Object|String|Array} optional, options or fields
 * @param {Function} callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.updateById = function (id, obj, opts, fn) {
  return this.update({ _id: id }, obj, opts, fn)
}

/**
 * remove
 *
 * @param {Object} search query
 * @param {Object|Function} optional, options or callback
 * @param {Function} optional, callback
 * @return {Promise}
 */

Collection.prototype.remove = function (search, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = this.opts(opts)

  // cast
  if (opts.castIds !== false) {
    search = this.cast(search)
  }

  // query
  debug('%s remove %j with %j', this.name, search, opts)
  return new Promise(function (resolve, reject) {
    this.col.remove(search, opts, util.callback(resolve, reject, fn))
  }.bind(this))
}

/**
 * remove by ID
 *
 * @param {String} hex id
 * @param {Object|String|Array} optional, options or fields
 * @param {Function} completion callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.removeById = function (id, opts, fn) {
  return this.remove({ _id: id }, opts, fn)
}

/**
 * findAndModify
 *
 * @param {Object} search query, or { query, update } object
 * @param {Object} optional, update object
 * @param {Object|String|Array} optional, options or fields
 * @param {Function} callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.findAndModify = function (query, update, opts, fn) {
  query = query || {}

  if (typeof query.query !== 'object' && typeof query.update !== 'object') {
    query = {
      query: query,
      update: update
    }
  } else {
    fn = opts
    opts = update
  }

  if (typeof query.query === 'string' || typeof query.query.toHexString === 'function') {
    query.query = { _id: query.query }
  }

  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = this.opts(opts)

  // `new` defaults to `true` for upserts
  if (opts.new == null && opts.upsert) {
    opts.new = true
  }

  // cast
  if (opts.castIds !== false) {
    query.query = this.cast(query.query)
    query.update = this.cast(query.update)
  }

  // query
  debug('%s findAndModify %j with %j', this.name, query.query, query.update)
  return new Promise(function (resolve, reject) {
    this.col.findAndModify(
      query.query,
      [],
      query.update,
      this.opts(opts),
      util.callback(resolve, reject, fn, function (err, doc, next) {
        next(err, doc && doc.value)
      }))
  }.bind(this))
}

/**
 * insert
 *
 * @param {Object} data
 * @param {Object|String|Array} optional, options or fields
 * @param {Function} callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.insert = function (data, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = this.opts(opts)

  var arrayInsert = Array.isArray(data)

  // cast
  if (opts.castIds !== false) {
    data = this.cast(data)
  }

  // query
  debug('%s insert %j', this.name, data)
  return new Promise(function (resolve, reject) {
    this.col.insert(data, opts, util.callback(resolve, reject, fn, function (err, docs, next) {
      var res = (docs || {}).ops
      if (res && !arrayInsert) {
        res = docs.ops[0]
      }
      next(err, res)
    }))
  }.bind(this))
}

/**
 * findOne by ID
 *
 * @param {String} hex id
 * @param {Object|String|Array} optional, options or fields
 * @param {Function} completion callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.findById = function (id, opts, fn) {
  return this.findOne({ _id: id }, opts, fn)
}

/**
 * find
 *
 * @param {Object} query
 * @param {Object|String|Array} optional, options or fields
 * @param {Function} completion callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.find = function (query, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  // opts
  opts = this.opts(opts)

  // cast
  if (opts.castIds !== false) {
    query = this.cast(query)
  }

  // query
  debug('%s find %j', this.name, query)

  var didClose = false
  var promise = new Promise(function (resolve, reject) {
    Promise.resolve(this.col.find(query, opts)).then(function (cursor) {
      if (opts.stream || promise.eachListener) {
        stream()
      } else {
        cursor.toArray(util.callback(resolve, reject, fn))
      }

      function destroy () {
        didClose = true
        cursor = cursor.cursor || cursor
        cursor.close()
      }

      function stream () {
        cursor.each(function (err, doc) {
          if (didClose && !err) {
            // emit success
            err = doc = null
          }

          if (err) {
            if (fn) {
              fn(err)
            }
            reject(err)
          } else if (doc) {
            promise.eachListener(doc, destroy)
          } else {
            if (fn) {
              fn()
            }
            resolve()
          }
        })
      }
    })
  }.bind(this))

  promise.each = function (eachListener) {
    promise.eachListener = eachListener
    return promise
  }

  return promise
}

/**
 * distinct
 *
 * @param {String} distinct field to select
 * @param {Object} optional, query
 * @param {Function} completion callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.distinct = function (field, query, fn) {
  if (typeof query === 'function') {
    fn = query
    query = {}
  }

  // cast
  query = this.cast(query)

  // query
  debug('%s distinct %s (%j)', this.name, field, query)
  return new Promise(function (resolve, reject) {
    this.col.distinct(field, query, util.callback(resolve, reject, fn))
  }.bind(this))
}

/**
 * count
 *
 * @param {Object} query
 * @param {Function} completion callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.count = function (query, fn) {
  // cast
  query = this.cast(query)

  // query
  debug('%s count %j', this.name, query)
  return new Promise(function (resolve, reject) {
    this.col.count(query, util.callback(resolve, reject, fn))
  }.bind(this))
}

/**
 * findOne
 *
 * @param {String|ObjectId|Object} query
 * @param {Object} options
 * @param {Function} completion callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.findOne = function (search, opts, fn) {
  search = search || {}

  if (typeof search === 'string' || typeof search.toHexString === 'function') {
    return this.findById(search, opts, fn)
  }

  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = this.opts(opts)

  // cast
  if (opts.castIds !== false) {
    search = this.cast(search)
  }

  // query
  debug('%s findOne %j', this.name, search)
  return new Promise(function (resolve, reject) {
    this.col.findOne(search, opts, util.callback(resolve, reject, fn))
  }.bind(this))
}

/**
 * Drops the collection.
 *
 * @param {Function} optional, callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.drop = function (fn) {
  debug('%s drop', this.name)
  return new Promise(function (resolve, reject) {
    this.col.drop(function (err, res) {
      if (err && err.message === 'ns not found') {
        err = undefined
        res = 'ns not found'
      }
      util.callback(resolve, reject, fn)(err, res)
    })
  }.bind(this))
}

/**
 * aggregate
 *
 * @param {Array} aggregation stages
 * @param {Object|Function} optional, options or callback
 * @param {Function} optional, callback
 * @return {Promise}
 */

Collection.prototype.aggregate = function (stages, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = this.opts(opts)
  // query
  debug('%s aggregate %j', this.name, stages)
  return new Promise(function (resolve, reject) {
    this.col.aggregate(stages, opts, util.callback(resolve, reject, fn))
  }.bind(this))
}

/**
 * Applies ObjectId casting to _id fields.
 *
 * @param {Object} optional, query
 * @return {Object} query
 * @api private
 */

Collection.prototype.cast = function (obj) {
  obj = obj || {}

  if (obj._id) {
    if (obj._id.$in) {
      obj._id.$in = obj._id.$in.map(function (q) {
        return this.id(q)
      }, this)
    } else if (obj._id.$nin) {
      obj._id.$nin = obj._id.$nin.map(function (q) {
        return this.id(q)
      }, this)
    } else if (obj._id.$ne) {
      obj._id.$ne = this.id(obj._id.$ne)
    } else {
      obj._id = this.id(obj._id)
    }
  }

  if (obj.$set && obj.$set._id) {
    obj.$set._id = this.id(obj.$set._id)
  }

  if (obj.$not && obj.$not._id) {
    obj.$not._id = this.id(obj.$not._id)
  }

  if (obj.$and && Array.isArray(obj.$and)) {
    obj.$and = obj.$and.map(function (q) {
      return this.cast(q)
    }, this)
  }

  if (obj.$or && Array.isArray(obj.$or)) {
    obj.$or = obj.$or.map(function (q) {
      return this.cast(q)
    }, this)
  }

  if (obj.$nor && Array.isArray(obj.$nor)) {
    obj.$nor = obj.$nor.map(function (q) {
      return this.cast(q)
    }, this)
  }

  return obj
}

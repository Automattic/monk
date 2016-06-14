const util = require('./util')
const debug = require('debug')('monk:queries')
const {EventEmitter} = require('events')

/**
 * Collection.
 *
 * @api public
 */

class Collection extends EventEmitter {
  constructor (manager, name) {
    super()
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
    this.indexes = this.indexes.bind(this)
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
    this.drop = this.drop.bind(this)
    this.cast = this.cast.bind(this)
  }

  /**
   * Casts to objectid
   *
   * @param {Mixed} hex id or ObjectId
   * @return {ObjectId}
   * @api public
   */
  id (str) {
    if (str == null) return this.col.id()
    return typeof str === 'string' ? this.col.id(str) : str
  }

  /**
   * Opts utility.
   */
  opts (opts) {
    opts = util.options(opts || {})

    for (let i in this.manager.options) {
      if (!(i in opts) && !(i in this.options)) {
        opts[i] = this.manager.options[i]
      }
    }

    for (let i in this.options) {
      if (!(i in opts)) {
        opts[i] = this.options[i]
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
  ensureIndex (fields, opts, fn) {
    if (typeof opts === 'function') {
      fn = opts
      opts = {}
    }

    fields = util.fields(fields)

    // query
    debug('%s ensureIndex %j (%j)', this.name, fields, opts)
    return new Promise((resolve, reject) => {
      this.col.ensureIndex(fields, opts, util.callback(resolve, reject, fn))
    })
  }

  /**
   * Gets all indexes.
   *
   * @param {Function} callback
   * @return {Promise}
   * @api public
   */
  indexes (fn) {
    debug('%s indexInformation', this.name)
    return new Promise((resolve, reject) => {
      this.col.indexInformation(util.callback(resolve, reject, fn))
    })
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
  update (search, update, opts, fn) {
    if (typeof search === 'string' || typeof search.toHexString === 'function') {
      return this.update({ _id: search }, update, opts, fn)
    }

    if (typeof opts === 'function') {
      fn = opts
      opts = {}
    }

    opts = this.opts(opts)

    // cast
    search = this.cast(search)
    update = this.cast(update)

    // query
    debug('%s update %j with %j', this.name, search, update)
    return new Promise((resolve, reject) => {
      this.col.update(search, update, opts, util.callback(resolve, reject, fn, function (err, doc, next) {
        next(err, doc && doc.result || doc)
      }))
    })
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
  updateById (id, obj, opts, fn) {
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
  remove (search, opts, fn) {
    if (typeof opts === 'function') {
      fn = opts
      opts = {}
    }

    opts = this.opts(opts)

    // cast
    search = this.cast(search)

    // query
    debug('%s remove %j with %j', this.name, search, opts)
    return new Promise((resolve, reject) => {
      this.col.remove(search, opts, util.callback(resolve, reject, fn))
    })
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
  removeById (id, opts, fn) {
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
  findAndModify (query = {}, update, opts, fn) {
    if (typeof query.query !== 'object' && typeof query.update !== 'object') {
      query = {
        query,
        update
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

    opts = opts || {}

    // `new` defaults to `true` for upserts
    if (opts.new == null && opts.upsert) {
      opts.new = true
    }

    // cast
    query.query = this.cast(query.query)
    query.update = this.cast(query.update)

    // query
    debug('%s findAndModify %j with %j', this.name, query.query, query.update)
    return new Promise((resolve, reject) => {
      this.col.findAndModify(
        query.query,
        [],
        query.update,
        this.opts(opts),
        util.callback(resolve, reject, fn, function (err, doc, next) {
          next(err, doc && doc.value)
        }))
    })
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
  insert (data, opts, fn) {
    if (typeof opts === 'function') {
      fn = opts
      opts = {}
    }

    opts = this.opts(opts)

    const arrayInsert = Array.isArray(data)

    // cast
    data = this.cast(data)

    // query
    debug('%s insert %j', this.name, data)
    return new Promise((resolve, reject) => {
      this.col.insert(data, opts, util.callback(resolve, reject, fn, function (err, docs, next) {
        let res = docs.ops
        if (res && !arrayInsert) {
          res = docs.ops[0]
        }
        next(err, res)
      }))
    })
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
  findById (id, opts, fn) {
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
  find (query, opts, fn) {
    if (typeof opts === 'function') {
      fn = opts
      opts = {}
    }

    // cast
    query = this.cast(query)

    // opts
    opts = this.opts(opts)

    // query
    debug('%s find %j', this.name, query)

    let didClose = false
    const promise = new Promise((resolve, reject) => {
      Promise.resolve(this.col.find(query, opts)).then((cursor) => {
        if (opts.stream == null) {
          if (promise.eachListener) {
            stream()
          } else {
            cursor.toArray(util.callback(resolve, reject, fn))
          }
        } else if (opts.stream) {
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
    })

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
  distinct (field, query, fn) {
    if (typeof query === 'function') {
      fn = query
      query = {}
    }

    // cast
    query = this.cast(query)

    // query
    debug('%s distinct %s (%j)', this.name, field, query)
    return new Promise((resolve, reject) => {
      this.col.distinct(field, query, util.callback(resolve, reject, fn))
    })
  }

  /**
   * count
   *
   * @param {Object} query
   * @param {Function} completion callback
   * @return {Promise}
   * @api public
   */
  count (query, fn) {
    // cast
    query = this.cast(query)

    // query
    debug('%s count %j', this.name, query)
    return new Promise((resolve, reject) => {
      this.col.count(query, util.callback(resolve, reject, fn))
    })
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
  findOne (search, opts, fn) {
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
    search = this.cast(search)

    // query
    debug('%s findOne %j', this.name, search)
    return new Promise((resolve, reject) => {
      this.col.findOne(search, opts, util.callback(resolve, reject, fn))
    })
  }

  /**
   * Drops the collection.
   *
   * @param {Function} optional, callback
   * @return {Promise}
   * @api public
   */
  drop (fn) {
    debug('%s drop', this.name)
    return new Promise((resolve, reject) => {
      this.col.drop((err, res) => {
        if (err && err.message === 'ns not found') {
          err = undefined
          res = 'ns not found'
        }
        util.callback(resolve, reject, fn)(err, res)
      })
    })
  }

  /**
   * Applies ObjectId casting to _id fields.
   *
   * @param {Object} optional, query
   * @return {Object} query
   * @api private
   */
  cast (obj = {}) {
    if (obj._id) {
      if (obj._id.$in) {
        obj._id.$in = obj._id.$in.map((q) => {
          return this.id(q)
        })
      } else if (obj._id.$nin) {
        obj._id.$nin = obj._id.$nin.map((q) => {
          return this.id(q)
        })
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
      obj.$and = obj.$and.map((q) => {
        return this.cast(q)
      }, this)
    }

    if (obj.$or && Array.isArray(obj.$or)) {
      obj.$or = obj.$or.map((q) => {
        return this.cast(q)
      }, this)
    }

    if (obj.$nor && Array.isArray(obj.$nor)) {
      obj.$nor = obj.$nor.map((q) => {
        return this.cast(q)
      }, this)
    }

    return obj
  }
}

/**
 * Module exports
 */

module.exports = Collection

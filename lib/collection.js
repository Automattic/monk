/*
 * Module dependencies.
 */

var util = require('./util')
var debug = require('debug')('monk:queries')

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

/*
 * Module exports
 */

module.exports = Collection

/**
 * Mongo Collection.
 *
 */

function Collection (manager, name, options) {
  this.manager = manager
  this.name = name
  this.options = options || {}

  delete this.options.cache

  this.oid = this.id
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
  this.findOneAndUpdate = this.findOneAndUpdate.bind(this)
  this.findOneAndDelete = this.findOneAndDelete.bind(this)
  this.insert = this.insert.bind(this)
  this.findById = this.findById.bind(this)
  this.find = this.find.bind(this)
  this.distinct = this.distinct.bind(this)
  this.count = this.count.bind(this)
  this.findOne = this.findOne.bind(this)
  this.aggregate = this.aggregate.bind(this)
  this.drop = this.drop.bind(this)
  util.cast = util.cast.bind(this)
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

/**
 * Opts utility.
 * @private
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
 * Calculates aggregate values for the data in a collection.
 *
 * @param {Array} pipeline - A sequence of data aggregation operations or stages.
 * @param {Object|Function} [opts]
 * @param {Function} [fn]
 * @return {Promise}
 */

Collection.prototype.aggregate = function (stages, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  // opts
  opts = this.opts(opts)

  // query
  debug('%s aggregate %j', this.name, stages)
  return this.executeWhenOpened().then(function (col) {
    return col.aggregate(stages, opts)
  }).then(function (cursor) {
    return cursor.toArray()
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * Perform a bulkWrite operation without a fluent API
 *
 * http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#bulkWrite
 *
 * @param {Array} operations - Bulk operations to perform.
 * @param {Object} [opts] options
 * @param {Function} [fn] callback
 * @return {Promise}
 */

Collection.prototype.bulkWrite = function (operations, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = this.opts(opts)

  // cast
  if (opts.castIds !== false) {
    operations = util.cast(operations)
  }

  // query
  debug('%s bulkWrite %j', this.name, operations)
  return this.executeWhenOpened().then(function (col) {
    return col.bulkWrite(operations, opts)
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * Returns the count of documents that would match a find() query. The db.collection.count() method does not perform the find() operation but instead counts and returns the number of results that match a query.
 *
 * @param {Object} query - The query selection criteria.
 * @param {Object} [opts] - Extra options for modifying the count.
 * @param {Function} [fn] - completion callback.
 * @return {Promise}
 */

Collection.prototype.count = function (query, opts, fn) {
  query = util.query(query)

  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  // opts
  opts = this.opts(opts)

  // cast
  if (opts.castIds !== false) {
    query = util.cast(query)
  }

  // query
  debug('%s count %j', this.name, query)
  return this.executeWhenOpened().then(function (col) {
    return col.count(query, opts)
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * Finds the distinct values for a specified field across a single collection and returns the results in an array.
 *
 * @param {String} field - The field for which to return distinct values.
 * @param {Object} [query] - A query that specifies the documents from which to retrieve the distinct values.
 * @param {Object} [opts] - options
 * @param {Function} [fn] completion callback
 * @return {Promise}
 */

Collection.prototype.distinct = function (field, query, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  if (typeof query === 'function') {
    fn = query
    query = {}
  }

  query = util.query(query)

  // opts
  opts = this.opts(opts)

  // cast
  if (opts.castIds !== false) {
    query = util.cast(query)
  }

  // query
  debug('%s distinct %s (%j)', this.name, field, query)
  return this.executeWhenOpened().then(function (col) {
    return col.distinct(field, query, opts)
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * Removes a collection from the database. The method also removes any indexes associated with the dropped collection.
 *
 * @param {Function} [fn] callback
 * @return {Promise}
 */

Collection.prototype.drop = function (fn) {
  debug('%s drop', this.name)
  return this.executeWhenOpened().then(function (col) {
    return col.drop()
  }).catch(function (err) {
    if (err && err.message === 'ns not found') {
      return 'ns not found'
    } else {
      throw err
    }
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * Drops or removes the specified index or indexes from a collection.
 *
 * https://docs.mongodb.com/manual/reference/method/db.collection.dropIndex/
 *
 * @param {Object|String|Array} fields
 * @param {Object} [opts]
 * @param {Function} [fn] callback
 * @return {Promise}
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
  return this.executeWhenOpened().then(function (col) {
    return col.dropIndex(fields, opts)
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * Drops all indexes other than the required index on the _id field.
 *
 * https://docs.mongodb.com/manual/reference/method/db.collection.dropIndexes/
 *
 * @param {Function} [fn] callback
 *
 * @example
 *
 * users.dropIndexes()
 * @return {Promise}
 */

Collection.prototype.dropIndexes = function (fn) {
  // query
  debug('%s dropIndexes', this.name)
  return this.executeWhenOpened().then(function (col) {
    return col.dropIndexes()
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * Creates indexes on collections.
 *
 * https://docs.mongodb.com/manual/reference/method/db.collection.ensureIndex/
 *
 * @param {Object|String|Array} fields
 * @param {Object} [opts] options
 * @param {Function} [fn] callback
 *
 * @example
 *
 * users.index('name.first')
 * users.index('name last')
 * users.index(['nombre', 'apellido'])
 * users.index({ up: 1, down: -1 })
 * users.index({ woot: 1 }, { unique: true })
 * @return {Promise}
 */

Collection.prototype.ensureIndex = function (fields, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  fields = util.fields(fields)

  // query
  debug('%s ensureIndex %j (%j)', this.name, fields, opts)
  return this.executeWhenOpened().then(function (col) {
    return col.ensureIndex(fields, opts)
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * Selects documents in a collection and return them.
 *
 * @param {String|Object|ObjectId} query
 * @param {Object|String|Array} [opts] options or fields
 * @param {Function} [fn] completion callback
 * @return {Promise}
 */

Collection.prototype.find = function (query, opts, fn) {
  query = util.query(query)

  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  // opts
  opts = this.opts(opts)

  // cast
  if (opts.castIds !== false) {
    query = util.cast(query)
  }

  // query
  debug('%s find %j', this.name, query)

  if (opts.rawCursor) {
    delete opts.rawCursor
    return this.executeWhenOpened().then(function (col) {
      return col.find(query, opts)
    }).then(thenFn(fn)).catch(catchFn(fn))
  }

  var promise = this.executeWhenOpened().then(function (col) {
    return col.find(query, opts)
  }).then(function (cursor) {
    if (!opts.stream && !promise.eachListener) {
      return cursor.toArray().then(thenFn(fn)).catch(catchFn(fn))
    }

    if (typeof opts.stream === 'function') {
      promise.eachListener = opts.stream
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

/**
 * @deprecated
 * Modifies and returns a single document. By default, the returned document does not include the modifications made on the update. To return the document with the modifications made on the update, use the `new` option.
 *
 * @param {Object} search query, or { query, update } object
 * @param {Object} [update] object
 * @param {Object|String|Array} [opts] options or fields
 * @param {Function} [fn] callback
 *
 * @example
 *
 * users.findAndModify({ name: 'Mathieu' }, { $set: { foo: 'bar' } }, opts)
 * users.findAndModify({ query: { name: 'Mathieu' }, update: { $set: { foo: 'bar' } }}, opts)
 * @return {Promise}
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

  query.query = util.query(query.query)

  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = this.opts(opts)

  if (opts.remove) {
    console.warn('DEPRECATED (collection.findAndModify): use collection.findOneAndDelete instead (see https://Automattic.github.io/monk/docs/collection/findOneAndDelete.html)')
  } else {
    console.warn('DEPRECATED (collection.findAndModify): use collection.findOneAndUpdate instead (see https://Automattic.github.io/monk/docs/collection/findOneAndUpdate.html)')
  }

  // `new` defaults to `true` for upserts
  if (opts.new == null && opts.upsert) {
    opts.new = true
  }

  // cast
  if (opts.castIds !== false) {
    query.query = util.cast(query.query)
    query.update = util.cast(query.update)
  }

  // query
  debug('%s findAndModify %j with %j', this.name, query.query, query.update)
  return this.executeWhenOpened().then(function (col) {
    return col.findAndModify(
      query.query,
      [],
      query.update,
      opts
    )
  }).then(function (doc) {
    return doc && doc.value || doc
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * Returns one document that satisfies the specified query criteria. If multiple documents satisfy the query, this method returns the first document according to the natural order which reflects the order of documents on the disk. In capped collections, natural order is the same as insertion order. If no document satisfies the query, the method returns null.
 *
 * https://docs.mongodb.com/manual/reference/method/db.collection.findOne/
 *
 * @param {String|ObjectId|Object} query
 * @param {Object} [opts] - options
 * @param {Function} [fn] - completion callback
 *
 * @example
 *
 * users.findOne({name: 'foo'}).then((doc) => {})
 * @return {Promise}
 */

Collection.prototype.findOne = function (query, opts, fn) {
  query = util.query(query)

  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  // opts
  opts = this.opts(opts)

  // cast
  if (opts.castIds !== false) {
    query = util.cast(query)
  }

  // query
  debug('%s findOne %j', this.name, query)
  return this.executeWhenOpened().then(function (col) {
    return col.find(query, opts).limit(1).toArray()
  }).then(function (docs) {
    return docs && docs[0] || null
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * @deprecated
 * findOne by ID helper
 *
 * @see findOne
 *
 * @param {String} hex id
 * @param {Object|String|Array} [opts] options or fields
 * @param {Function} [fn] completion callback
 * @return {Promise}
 */

Collection.prototype.findById = function (id, opts, fn) {
  console.warn('DEPRECATED (collection.findById): use collection.findOne instead (see https://Automattic.github.io/monk/docs/collection/findOne.html)')
  return this.findOne({ _id: id }, opts, fn)
}

/**
 * Find a document and delete it in one atomic operation, requires a write lock for the duration of the operation.
 *
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#findOneAndDelete
 *
 * @param {String|Object|ObjectId} query
 * @param {Object|String|Array} [opts] options or fields
 * @param {Function} [fn] callback
 * @return {Promise}
 */

Collection.prototype.findOneAndDelete = function (query, opts, fn) {
  query = util.query(query)

  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = this.opts(opts)

  // cast
  if (opts.castIds !== false) {
    query = util.cast(query)
  }

  // query
  debug('%s findOneAndDelete %j with %j', this.name, query)
  return this.executeWhenOpened().then(function (col) {
    return col.findOneAndDelete(query, opts)
  }).then(function (doc) {
    return doc && doc.value || doc
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * Find a document and update it in one atomic operation, requires a write lock for the duration of the operation.
 *
 * http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#findOneAndUpdate
 *
 * @param {String|Object|ObjectId} query
 * @param {Object} update
 * @param {Object|String|Array} [opts] options or fields
 * @param {Function} [fn] callback
 *
 * @example
 *
 * users.findOneAndUpdate({ name: 'Mathieu' }, opts)
 * users.findOneAndUpdate({ query: { name: 'Mathieu' }, opts)
 * @return {Promise}
 */

Collection.prototype.findOneAndUpdate = function (query, update, opts, fn) {
  query = util.query(query)

  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = this.opts(opts)

  if (typeof opts.returnOriginal === 'undefined') {
    opts.returnOriginal = false
  }

  // cast
  if (opts.castIds !== false) {
    query = util.cast(query)
  }

  // query
  debug('%s findOneAndUpdate %j with %j', this.name, query, update)
  return this.executeWhenOpened().then(function (col) {
    return col.findOneAndUpdate(query, update, opts)
  }).then(function (doc) {
    return doc && doc.value || doc
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * Run a group command across a collection
 *
 * http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#group
 *
 * @param {object | array | function} keys - An object, array or function expressing the keys to group by.
 * @param {Object} condition - An optional condition that must be true for a row to be considered.
 * @param {Object} initial - Initial value of the aggregation counter object.
 * @param {Function} reduce - The reduce function aggregates (reduces) the objects iterated.
 * @param {Function} [finalize] An optional function to be run on each item in the result set just before the item is returned.
 * @param {boolean} [command] Specify if you wish to run using the internal group command or using eval, default is true.
 * @param {Object} [opts] options
 * @param {Function} [fn] callback
 *
 * @example
 *
 * users.findOneAndUpdate({ name: 'Mathieu' }, opts)
 * users.findOneAndUpdate({ query: { name: 'Mathieu' }, opts)
 * @return {Promise}
 */

Collection.prototype.group = function (keys, condition, initial, reduce, finalize, command, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = this.opts(opts)

  // query
  debug('%s group %j with %j', this.name, keys, condition)
  return this.executeWhenOpened().then(function (col) {
    return col.group(keys, condition, initial, reduce, finalize, command, opts)
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * Returns an array that holds a list of documents that identify and describe the existing indexes on the collection.
 *
 * https://docs.mongodb.com/manual/reference/method/db.collection.getIndexes/
 *
 * @param {Function} [fn] callback
 * @return {Promise}
 */

Collection.prototype.indexes = function (fn) {
  debug('%s indexInformation', this.name)
  return this.executeWhenOpened().then(function (col) {
    return col.indexInformation()
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * Inserts a document or documents into a collection.
 *
 * https://docs.mongodb.com/manual/reference/method/db.collection.insert/
 *
 * @param {Object|Array} data
 * @param {Object} [opts] options
 * @param {Function} [fn] callback
 *
 * @example
 *
 * users.insert({ woot: 'foo' })
 * users.insert([{ woot: 'bar' }, { woot: 'baz' }])
 * @return {Promise}
 */

Collection.prototype.insert = function (data, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = this.opts(opts)

  var arrayInsert = Array.isArray(data)

  if (arrayInsert && data.length === 0) {
    debug('%s inserting empty array in %j', this.name)
    return Promise.resolve([])
  }

  // cast
  if (opts.castIds !== false) {
    data = util.cast(data)
  }

  // query
  debug('%s insert %j', this.name, data)
  return this.executeWhenOpened().then(function (col) {
    return col.insert(data, opts)
  }).then(function (docs) {
    var res = (docs || {}).ops
    if (res && !arrayInsert) {
      res = docs.ops[0]
    }
    return res
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * Removes documents from a collection.
 *
 * https://docs.mongodb.com/manual/reference/method/db.collection.remove/
 *
 * @param {Object|ObjectId|String} search query
 * @param {Object} [opts]  options
 * @param {Function} [fn] callback
 *
 * @example
 *
 * users.remove({ name: 'Mathieu' })
 * @return {Promise}
 */

Collection.prototype.remove = function (query, opts, fn) {
  query = util.query(query)

  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = this.opts(opts)

  // cast
  if (opts.castIds !== false) {
    query = util.cast(query)
  }

  // query
  debug('%s remove %j with %j', this.name, query, opts)
  return this.executeWhenOpened().then(function (col) {
    return col.remove(query, opts)
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * @deprecated
 * remove by ID helper
 * @see remove
 *
 * @param {String} hex id
 * @param {Object} [opts]  options
 * @param {Function} [fn] callback
 *
 * @example
 *
 * users.removeById(id)
 * @return {Promise}
 */

Collection.prototype.removeById = function (id, opts, fn) {
  console.warn('DEPRECATED (collection.removeById): use collection.remove instead (see https://Automattic.github.io/monk/docs/collection/remove.html)')
  return this.remove({ _id: id }, opts, fn)
}

/**
 * Modifies an existing document or documents in a collection. The method can modify specific fields of an existing document or documents or replace an existing document entirely, depending on the update parameter. By default, the update() method updates a single document. Set the `multi` option to update all documents that match the query criteria.
 *
 * https://docs.mongodb.com/manual/reference/method/db.collection.update/
 *
 * @param {Object} query
 * @param {Object} update obj
 * @param {Object|String|Array} [opts], options or fields
 * @param {Function} [fn] callback
 *
 * @example
 *
 * users.update({ name: 'Mathieu' }, { $set: { foo: 'bar' } })
 * @return {Promise}
 */

Collection.prototype.update = function (query, update, opts, fn) {
  query = util.query(query)

  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  opts = this.opts(opts)

  // cast
  if (opts.castIds !== false) {
    query = util.cast(query)
    update = util.cast(update)
  }

  // query
  debug('%s update %j with %j', this.name, query, update)
  return this.executeWhenOpened().then(function (col) {
    return col.update(query, update, opts)
  }).then(function (doc) {
    return doc && doc.result || doc
  }).then(thenFn(fn)).catch(catchFn(fn))
}

/**
 * @deprecated
 * update by id helper
 * @see update
 *
 * @param {String|Object} id - object id
 * @param {Object} update - update obj
 * @param {Object|String|Array} [opts] options or fields
 * @param {Function} [fn] callback
 *
 * @example
 *
 * users.updateById(id, { $set: { foo: 'bar' } })
 * @return {Promise}
 */

Collection.prototype.updateById = function (id, update, opts, fn) {
  console.warn('DEPRECATED (collection.updateById): use collection.update instead (see https://Automattic.github.io/monk/docs/collection/update.html)')
  return this.update({ _id: id }, update, opts, fn)
}

/**
 * @deprecated
 */

Collection.prototype.id = function (str) {
  console.warn('DEPRECATED (collection.id): use monk.id instead (see https://Automattic.github.io/monk/docs/id.html)')
  return require('./helpers').id(str)
}

var applyMiddlewares = require('./applyMiddlewares')

module.exports = Collection

function Collection (manager, name, options) {
  this.manager = manager
  this.name = name
  this.options = options

  this.middlewares = this.options.middlewares || []
  delete this.options.middlewares

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

  this._dispatch = applyMiddlewares(this.middlewares)(manager, this)
}

Collection.prototype.aggregate = function (stages, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  return this._dispatch(function aggregate (args) {
    return args.col.aggregate(args.stages, args.options).toArray()
  })({options: opts, stages: stages, callback: fn}, 'aggregate')
}

Collection.prototype.bulkWrite = function (operations, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  return this._dispatch(function bulkWrite (args) {
    return args.col.bulkWrite(args.operations, args.options)
  })({options: opts, operations: operations, callback: fn}, 'bulkWrite')
}

Collection.prototype.count = function (query, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  return this._dispatch(function count (args) {
    return args.col.count(args.query, args.options)
  })({options: opts, query: query, callback: fn}, 'count')
}

Collection.prototype.createIndex = function (fields, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  return this._dispatch(function createIndex (args) {
    return args.col.createIndex(args.fields, args.options)
  })({options: opts, fields: fields, callback: fn}, 'createIndex')
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

  return this._dispatch(function distinct (args) {
    return args.col.distinct(args.field, args.query, args.options)
  })({options: opts, query: query, field: field, callback: fn}, 'distinct')
}

Collection.prototype.drop = function (fn) {
  return this._dispatch(function drop (args) {
    return args.col.drop().catch(function (err) {
      if (err && err.message === 'ns not found') {
        return 'ns not found'
      } else {
        throw err
      }
    })
  })({callback: fn}, 'drop')
}

Collection.prototype.dropIndex = function (fields, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  return this._dispatch(function dropIndex (args) {
    return args.col.dropIndex(args.fields, args.options)
  })({options: opts, fields: fields, callback: fn}, 'dropIndex')
}

Collection.prototype.dropIndexes = function (fn) {
  return this._dispatch(function dropIndexes (args) {
    return args.col.dropIndexes()
  })({callback: fn}, 'dropIndexes')
}

Collection.prototype.ensureIndex = function (fields, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  console.warn('DEPRECATED (collection.ensureIndex): use collection.createIndex instead (see https://Automattic.github.io/monk/docs/collection/createIndex.html)')

  return this._dispatch(function ensureIndex (args) {
    return args.col.ensureIndex(args.fields, args.options)
  })({options: opts, fields: fields, callback: fn}, 'ensureIndex')
}

Collection.prototype.find = function (query, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  if ((opts || {}).rawCursor) {
    delete opts.rawCursor
    return this._dispatch(function find (args) {
      return Promise.resolve(args.col.find(args.query, args.options))
    })({options: opts, query: query, callback: fn}, 'find')
  }

  var promise = this._dispatch(function find (args) {
    var cursor = args.col.find(args.query, args.options)

    if (!(opts || {}).stream && !promise.eachListener) {
      return cursor.toArray()
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
  })({options: opts, query: query, callback: fn}, 'find')

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

  return this._dispatch(function findOne (args) {
    return args.col.find(args.query, args.options).limit(1).toArray()
    .then(function (docs) {
      return (docs && docs[0]) || null
    })
  })({options: opts, query: query, callback: fn}, 'findOne')
}

Collection.prototype.findOneAndDelete = function (query, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }
  return this._dispatch(function findOneAndDelete (args) {
    return args.col.findOneAndDelete(args.query, args.options)
      .then(function (doc) {
        if (doc && typeof doc.value !== 'undefined') {
          return doc.value
        }
        if (doc.ok && doc.lastErrorObject && doc.lastErrorObject.n === 0) {
          return null
        }
        return doc
      })
  })({options: opts, query: query, callback: fn}, 'findOneAndDelete')
}

Collection.prototype.findOneAndUpdate = function (query, update, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }
  return this._dispatch(function findOneAndUpdate (args) {
    if (typeof (args.options || {}).returnOriginal === 'undefined') {
      args.options.returnOriginal = false
    }
    return args.col.findOneAndUpdate(args.query, args.update, args.options)
      .then(function (doc) {
        if (doc && typeof doc.value !== 'undefined') {
          return doc.value
        }
        if (doc.ok && doc.lastErrorObject && doc.lastErrorObject.n === 0) {
          return null
        }
        return doc
      })
  })({options: opts, query: query, update: update, callback: fn}, 'findOneAndUpdate')
}

Collection.prototype.geoHaystackSearch = function (x, y, opts, fn) {
  return this._dispatch(function update (args) {
    return args.col.geoHaystackSearch(args.x, args.y, args.options).then(function (doc) {
      return (doc && doc.results) || doc
    })
  })({x: x, y: y, options: opts, callback: fn}, 'geoHaystackSearch')
}

Collection.prototype.geoNear = function (x, y, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  return this._dispatch(function update (args) {
    return args.col.geoNear(args.x, args.y, args.options).then(function (doc) {
      return (doc && doc.results) || doc
    })
  })({x: x, y: y, options: opts, callback: fn}, 'geoNear')
}

Collection.prototype.group = function (keys, condition, initial, reduce, finalize, command, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }
  return this._dispatch(function group (args) {
    return args.col.group(args.keys, args.condition, args.initial, args.reduce, args.finalize, args.command, args.options)
  })({options: opts, keys: keys, condition: condition, initial: initial, reduce: reduce, finalize: finalize, command: command, callback: fn}, 'group')
}

Collection.prototype.indexes = function (fn) {
  return this._dispatch(function indexes (args) {
    return args.col.indexInformation()
  })({callback: fn}, 'indexes')
}

Collection.prototype.insert = function (data, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  return this._dispatch(function insert (args) {
    var arrayInsert = Array.isArray(args.data)

    if (arrayInsert && args.data.length === 0) {
      return Promise.resolve([])
    }
    return args.col.insert(args.data, args.options).then(function (docs) {
      var res = (docs || {}).ops
      if (res && !arrayInsert) {
        res = docs.ops[0]
      }
      return res
    })
  })({data: data, options: opts, callback: fn}, 'insert')
}

Collection.prototype.mapReduce = function (map, reduce, opts, fn) {
  return this._dispatch(function update (args) {
    return args.col.mapReduce(args.map, args.reduce, args.options)
  })({map: map, reduce: reduce, options: opts, callback: fn}, 'mapReduce')
}

Collection.prototype.remove = function (query, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }
  return this._dispatch(function remove (args) {
    var options = args.options || {}
    var method = options.single || options.multi === false ? 'deleteOne' : 'deleteMany'
    return args.col[method](args.query, args.options)
  })({query: query, options: opts, callback: fn}, 'remove')
}

Collection.prototype.stats = function (opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }
  return this._dispatch(function remove (args) {
    return args.col.stats(args.options)
  })({options: opts, callback: fn}, 'stats')
}

Collection.prototype.update = function (query, update, opts, fn) {
  if (typeof opts === 'function') {
    fn = opts
    opts = {}
  }

  return this._dispatch(function update (args) {
    var options = args.options || {}
    var method = options.multi || options.single === false ? 'updateMany' : 'updateOne'
    return args.col[method](args.query, args.update, args.options).then(function (doc) {
      return (doc && doc.result) || doc
    })
  })({update: update, query: query, options: opts, callback: fn}, 'update')
}

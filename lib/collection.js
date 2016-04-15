/**
 * Module dependencies.
 */

var util = require('./util')
  , debug = require('debug')('monk:queries')
  , EventEmitter = require('events').EventEmitter
  , Promise = require('./promise')
  , immediately = global.setImmediate || process.nextTick;

/**
 * Module exports
 */

module.exports = Collection;

/**
 * Collection.
 *
 * @api public
 */

function Collection (manager, name) {
  this.manager = manager;
  this.driver = manager.driver;
  this.helper = manager.helper;
  this.name = name;
  this.col = this.driver.collection(name);
  this.col.id = this.helper.id;
  this.options = {};
  this.col.emitter = this.col.emitter || this.col._emitter;
  this.col.emitter.setMaxListeners(Infinity);
}

/**
 * Inherits from EventEmitter.
 */

Collection.prototype.__proto__ = EventEmitter.prototype;

/**
 * Casts to objectid
 *
 * @param {Mixed} hex id or ObjectId
 * @return {ObjectId}
 * @api public
 */

Collection.prototype.id =
Collection.prototype.oid = function (str) {
  if (null == str) return this.col.id();
  return 'string' == typeof str ? this.col.id(str) : str;
};

/**
 * Opts utility.
 */

Collection.prototype.opts = function (opts) {
  opts = util.options(opts || {});

  for (var i in this.manager.options) {
    if (!(i in opts) && !(i in this.options)) {
      opts[i] = this.manager.options[i];
    }
  }

  for (var i in this.options) {
    if (!(i in opts)) {
      opts[i] = this.options[i];
    }
  }

  return opts;
};

/**
 * Set up indexes.
 *
 * @param {Object|String|Array} fields
 * @param {Object|Function} optional, options or callback
 * @param {Function} optional, callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.index =
Collection.prototype.ensureIndex = function (fields, opts, fn) {
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }

  var fields = util.fields(fields)
    , opts = opts || {}
    , promise = new Promise(this, 'index');

  if (fn) {
    promise.complete(fn);
  }

  // query
  debug('%s ensureIndex %j (%j)', this.name, fields, opts);
  this.col.ensureIndex(fields, opts, promise.resolve);

  return promise;
};

/**
 * Gets all indexes.
 *
 * @param {Function} callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.indexes = function (fn) {
  var promise = new Promise(this, 'indexes');

  if (fn) {
    promise.complete(fn);
  }

  // query
  debug('%s indexInformation', this.name);
  this.col.indexInformation(promise.resolve);

  return promise;
};

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
  if ('string' == typeof search || 'function' == typeof search.toHexString) {
    return this.update({ _id: search }, update, opts, fn);
  }

  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }

  opts = this.opts(opts);
  var promise = new Promise(this, 'update', opts);

  if (fn) {
    promise.complete(fn);
  }

  // cast
  search = this.cast(search);
  update = this.cast(update);

  // query
  var callback = opts.safe ? promise.resolve : function () {
    // node-mongodb-native will send err=undefined and call the fn
    // in the same tick if safe: false
    var args = arguments;
    args[0] = args[0] || null;
    immediately(function () {
      promise.resolve.apply(this, args);
    });
  };

  debug('%s update %j with %j', this.name, search, update);
  promise.query = { query: search, update: update };
  this.col.update(search, update, opts, function(err, result) {
    callback(err, opts.multi ? result.result.n : null)
  });

  return promise;
};

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
  return this.update({ _id: id }, obj, opts, fn);
};

/**
 * remove
 *
 * @param {Object} search query
 * @param {Object|Function} optional, options or callback
 * @param {Function} optional, callback
 * @return {Promise}
 */

Collection.prototype.remove = function (search, opts, fn) {
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }

  opts = this.opts(opts);
  var promise = new Promise(this, 'remove', opts);

  if (fn) {
    promise.complete(fn);
  }

  // cast
  search = this.cast(search);

  // query
  debug('%s remove %j with %j', this.name, search, opts);
  promise.query = search;
  this.col.remove(search, opts, promise.resolve);

  return promise;
};

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
  return this.remove({ _id: id }, opts, fn);
};

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
  query = query || {};

  if ('object' != typeof query.query && 'object' != typeof query.update) {
    query = {
        query: query
      , update: update
    };
  } else {
    fn = opts;
    opts = update;
  }

  if ('string' == typeof query.query || 'function' == typeof query.query.toHexString) {
    query.query = { _id: query.query };
  }

  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }

  opts = opts || {};

  // `new` defaults to `true` for upserts
  if (null == opts.new && opts.upsert) {
    opts.new = true;
  }

  var promise = new Promise(this, 'findAndModify', opts);

  if (fn) {
    promise.complete(fn);
  }

  // cast
  query.query = this.cast(query.query);
  query.update = this.cast(query.update);

  // query
  debug('%s findAndModify %j with %j', this.name, query.query, query.update);
  promise.query = query;
  this.col.findAndModify(
      query.query
    , []
    , query.update
    , this.opts(opts)
    , function(err, doc) {
      promise.resolve.call(this, err, doc.value)
    }
  );

  return promise;
};

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
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }

  opts = this.opts(opts);
  var promise = new Promise(this, 'insert', opts);

  if (fn) {
    promise.complete(fn);
  }
  var arrayInsert = Array.isArray(data);

  // cast
  data = this.cast(data);

  // query
  debug('%s insert %j', this.name, data);
  promise.query = data;
  this.col.insert(data, opts, function (err, docs) {
    immediately(function () {
      var res = docs.ops;
      if (docs && !arrayInsert) {
        res = docs.ops[0];
      }
      promise.resolve.call(promise, err, res);
    });
  });

  return promise;
};

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
  return this.findOne({ _id: id }, opts, fn);
};

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
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }

  // cast
  query = this.cast(query);

  // opts
  opts = this.opts(opts);

  // query
  debug('%s find %j', this.name, query);
  var cursor = this.col.find(query, opts);

  // promise
  var promise = new Promise(this, 'find', opts);
  promise.query = query;

  if (fn) {
    promise.complete(fn);
  }

  if (null == opts.stream) {
    immediately(function () {
      if (promise.listeners('each').length) {
        stream();
      } else {
        cursor.toArray(promise.resolve);
      }
    });
  } else if (opts.stream) {
    stream();
  } else {
    cursor.toArray(promise.resolve);
  }

  function stream () {
    var didClose = false;

    cursor.each(function (err, doc) {
      if (didClose && !err) {
        // emit success
        err = doc = null;
      }

      if (err) {
        promise.reject(err);
      } else if (doc) {
        promise.emit('each', doc);
      } else {
        promise.fulfill();
      }
    });

    promise.once('destroy', function(){
      didClose = true;
      cursor = cursor.cursor || cursor;
      cursor.close();
    });
  }

  return promise;
};

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
  if ('function' == typeof query) {
    fn = query;
    query = {};
  }

  var promise = new Promise(this, 'distinct');

  if (fn) {
    promise.complete(fn);
  }

  // cast
  query = this.cast(query);

  // query
  debug('%s distinct %s (%j)', this.name, field, query);
  promise.query = query;
  this.col.distinct(field, query, promise.resolve);

  return promise;
};

/**
 * count
 *
 * @param {Object} query
 * @param {Function} completion callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.count = function (query, fn) {
  var promise = new Promise(this, 'find');

  if (fn) {
    promise.complete(fn);
  }

  // cast
  query = this.cast(query);

  // query
  debug('%s count %j', this.name, query);
  promise.query = query;
  this.col.count(query, promise.resolve);

  return promise;
};

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
  search = search || {};

  if ('string' == typeof search || 'function' == typeof search.toHexString) {
    return this.findById(search, opts, fn);
  }

  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }

  opts = this.opts(opts);
  var promise = new Promise(this, 'findOne', opts);

  if (fn) {
    promise.complete(fn);
  }

  // cast
  search = this.cast(search);

  // query
  debug('%s findOne %j', this.name, search);
  promise.query = search;
  this.col.findOne(search, opts, promise.resolve);

  return promise;
};

/**
 * Applies ObjectId casting to _id fields.
 *
 * @param {Object} optional, query
 * @return {Object} query
 * @api private
 */

Collection.prototype.cast = function (obj) {
  obj = obj || {};

  if (obj._id) {
    obj._id = this.id(obj._id);
  }

  if (obj.$set && obj.$set._id) {
    obj.$set._id = this.id(obj.$set._id);
  }

  if (obj.$not && obj.$not._id) {
    obj.$not._id = this.id(obj.$not._id);
  }

  if (obj.$and && Array.isArray(obj.$and)) {
    obj.$and = obj.$and.map(function (q) {
      return this.cast(q);
    }, this);
  }

  if (obj.$or && Array.isArray(obj.$or)) {
    obj.$or = obj.$or.map(function (q) {
      return this.cast(q);
    }, this);
  }

  if (obj.$nor && Array.isArray(obj.$nor)) {
    obj.$nor = obj.$nor.map(function (q) {
      return this.cast(q);
    }, this);
  }

  return obj;
};

/**
 * Drops the collection.
 *
 * @param {Function} optional, callback
 * @return {Promise}
 * @api public
 */

Collection.prototype.drop = function (fn) {
  var promise = new Promise(this, 'drop');

  if (fn) {
    promise.complete(fn);
  }

  debug('%s drop', this.name);
  promise.query = this.name;
  this.col.drop(promise.resolve);

  return promise;
};

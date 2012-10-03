
/**
 * Module dependencies.
 */

var util = require('./util')
  , debug = require('debug')('monk:queries')
  , EventEmitter = require('events').EventEmitter
  , Promise = require('./promise');

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
  this.name = name;
  this.col = this.driver.collection(name);
  this.options = {};
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
  if (null == str) return this.col.ObjectID();
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
  debug('%s ensureIndex "%j" ("%j")', this.name, fields, opts);
  this.col.ensureIndex(fields, opts, promise.fulfill);

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
  this.col.indexInformation(promise.fulfill);

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

  var promise = new Promise(this, 'update');

  if (fn) {
    promise.on('complete', fn);
  }

  // cast
  search = this.cast(search);
  update = this.cast(update);

  // query
  debug('%s update %j with %j', this.name, search, update);
  opts = this.opts(opts);

  var callback = opts.safe ? promise.fulfill : function () {
    // node-mongodb-native will send err=undefined and call the fn
    // in the same tick if safe: false
    var args = arguments;
    args[0] = args[0] || null;
    process.nextTick(function () {
      promise.fulfill.apply(promise, args);
    });
  };

  this.col.update(search, update, opts, callback);

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

  var promise = new Promise(this, 'remove');

  if (fn) {
    promise.on('complete', fn);
  }

  // cast
  search = this.cast(search);

  // query
  debug('%s remove "%j" with "%j"', this.name, search, opts);
  this.col.remove(search, this.opts(opts), promise.fulfill);

  return promise;
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
  var promise = new Promise(this, 'findAndModify');

  query = query || {};

  if ('object' != typeof query.query && 'object' != typeof query.update) {
    query = {
        query: query
      , update: update
    };
  } else {
    opts = update;
    fn = opts;
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

  if (fn) {
    promise.on('complete', fn);
  }

  // cast
  query.query = this.cast(query.query);
  query.update = this.cast(query.update);

  // query
  debug('%s findAndModify "%j" with "%j"', this.name, query.query, query.update);
  this.col.findAndModify(
      query.query
    , []
    , query.update
    , this.opts(opts)
    , promise.fulfill
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

  var promise = new Promise(this, 'insert');

  if (fn) {
    promise.complete(fn);
  }

  // cast
  data = this.cast(data);

  // query
  debug('%s insert "%j"', this.name, data);
  this.col.insert(data, this.opts(opts), function (err, docs) {
    process.nextTick(function () {
      promise.fulfill.call(promise, err, docs ? docs[0] : docs);
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

  var promise = new Promise(this, 'find');

  if (fn) {
    promise.complete(fn);
  }

  // cast
  query = this.cast(query);

  // opts
  opts = this.opts(opts);

  // query
  debug('%s find "%j"', this.name, query);
  var cursor = this.col.find(query, opts);

  if (null == opts.stream) {
    process.nextTick(function () {
      if (promise.listeners('each').length) {
        stream();
      } else {
        cursor.toArray(promise.fulfill);
      }
    });
  } else if (opts.stream) {
    stream();
  } else {
    cursor.toArray(promise.fulfill);
  }

  function stream () {
    cursor.each(function (err, doc) {
      if (err) {
        promise.emit('error', err);
      } else if (doc) {
        promise.emit('each', doc);
      } else {
        promise.emit('success');
      }
    });
  }

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
  debug('%s count "%j"', this.name, query);
  this.col.count(query, promise.fulfill);

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

  var promise = new Promise(this, 'findOne');

  if (fn) {
    promise.complete(fn);
  }

  // cast
  search = this.cast(search);

  // query
  debug('findOne "%j"', search);
  this.col.findOne(search, this.opts(opts), promise.fulfill);

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

  this.col.drop(promise.fulfill);

  return promise;
};

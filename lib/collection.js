
/**
 * Module dependencies.
 */

var util = require('./util')
  , debug = require('debug')('monk:queries')
  , Promise = require('./promise')

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
}

/**
 * Casts to objectid
 *
 * @param {Mixed} hex id or ObjectId
 * @return {ObjectId}
 * @api public
 */

Collection.prototype.id = function (str) {
  return 'string' == typeof str ? this.col.id(str) : str;
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
    , promise = new Promise('index')

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
  var promise = new Promise('indexes');

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
 * @return {Promise}
 * @api public
 */

Collection.prototype.update = function (search, update, opts, fn) {
  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }

  var promise = new Promise('update');

  if (fn) {
    promise.on('complete', fn);
  }

  // cast
  search = this.cast(search);
  update = this.cast(update);

  // query
  debug('%s update "%j" with "%j"', this.name, search, update);
  this.col.update(
      search
    , update
    , util.options(opts)
    , promise.fulfill
  );

  return promise;
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

  var promise = new Promise('remove');

  if (fn) {
    promise.on('complete', fn);
  }

  // cast
  search = this.cast(search);

  // query
  debug('%s remove "%j" with "%j"', this.name, search, update);
  this.col.update(search, util.options(opts), promise.fulfill);

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
  var promise = new Promise();

  if ('object' != typeof query.query && 'object' != typeof query.update) {
    query = {
        query: query
      , update: update
    };
  } else {
    opts = update;
    fn = opts;
  }

  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
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
      this.cast(query)
    , this.options(opts)
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

  var promise = new Promise('insert');

  if (fn) {
    promise.complete(fn);
  }

  // cast
  data = this.cast(data);

  // query
  debug('%s insert "%j"', this.name, data);
  this.col.insert(data, util.options(opts), promise.fulfill);

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

  var promise = new Promise('find')

  if (fn) {
    promise.complete(fn);
  }

  // cast
  query = this.cast(query);

  // query
  debug('%s find "%j"', this.name, query);
  var cursor = this.col.find(query, util.options(opts));

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

  var promise = new Promise('findOne');

  if (fn) {
    promise.complete(fn);
  }

  // cast
  search = this.cast(search);

  // query
  debug('findOne "%j"', search);
  this.col.findOne(search, util.options(opts), promise.fulfill);

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
    obj._id = this.id(obj);
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
  var promise = new Promise('drop');

  if (fn) {
    promise.complete(fn);
  }

  this.col.drop(promise.fulfill);

  return promise;
};

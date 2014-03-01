/**
 * Module dependencies.
 */

var mongoskin = require('mongoskin')
  , debug = require('debug')('monk:manager')
  , Collection = require('./collection')
  , ObjectId = mongoskin.ObjectID
  , EventEmitter = require('events').EventEmitter;

/**
 * Module exports.
 */

module.exports = Manager;

/**
 * Manager constructor.
 *
 * @param {Array|String} connection uri. replica sets can be an array or
 * comma-separated
 * @param {Object|Function} options or connect callback
 * @param {Function} connect callback
 */

function Manager (uri, opts, fn) {
  if (!uri) {
    throw Error('No connection URI provided.');
  }
  
  if (!(this instanceof Manager)) {
    return new Manager(uri, opts, fn);
  }

  if ('function' == typeof opts) {
    fn = opts;
    opts = {};
  }

  opts = opts || {};
  opts.safe = true;

  if (Array.isArray(uri) || ~uri.indexOf(',')) {
    if ('string' == typeof uri) {
      uri = uri.split(',');
    }
    if (!opts.database) {
      for (var i = 0, l = uri.length; i < l; i++) {
        if (!opts.database) {
          opts.database = uri[i].replace(/([^\/])+\/?/, '');
        }
        uri[i] = uri[i].replace(/\/.*/, '');
      }
    }
    debug('repl set connection "%j" to database "%s"', uri, opts.database);
  }

  this.driver = mongoskin.db(uri, opts);
  this.driver.open(this.onOpen.bind(this));
  this.collections = {};
  this.options = { safe: true };

  if (fn) {
    this.once('open', fn);
  }
}

/**
 * Inherits from EventEmitter
 */

Manager.prototype.__proto__ = EventEmitter.prototype;

/**
 * Open callback.
 *
 * @api private
 */

Manager.prototype.onOpen = function () {
  this.emit('open');
};

/**
 * Closes the connection.
 *
 * @return {Manager} for chaining
 * @api private
 */

Manager.prototype.close = function (fn) {
  this.driver.close(fn);
  return this;
};

/**
 * Gets a collection.
 *
 * @return {Collection} collection to query against
 * @api private
 */

Manager.prototype.col =
Manager.prototype.get = function (name) {
  if (!this.collections[name]) {
    this.collections[name] = new Collection(this, name);
  }

  return this.collections[name];
};

/**
 * Casts to objectid
 *
 * @param {Mixed} hex id or ObjectId
 * @return {ObjectId}
 * @api public
 */

Manager.prototype.id =
Manager.prototype.oid = function (str) {
  if (null == str) return ObjectId();
  return 'string' == typeof str ? ObjectId.createFromHexString(str) : str;
};


/**
 * Module dependencies.
 */

var MPromise = require('mpromise');
var immediately = global.setImmediate || process.nextTick;

/**
 * Module exports.
 */

module.exports = Promise;

/**
 * Promise constructor.
 *
 * @param {Collection} collection
 * @param {String} type
 * @param {Object} query options
 * @api public
 */

function Promise (col, type, opts) {
  this.col = col;
  this.type = type;
  this.opts = opts || {};

  // MPromise constructor
  MPromise.call(this);

  // Compability methods
  this.success = this.onFulfill;
  this.error = this.onReject;
  this.complete = this.onResolve;
  this.onResolve(this.emitter.emit.bind(this.emitter,'complete'));
  this.once = this.emitter.once.bind(this.emitter)
  this.emit = this.emitter.emit.bind(this.emitter)

  // for practical purposes
  this.resolve = MPromise.prototype.resolve.bind(this);
  this.fulfill = MPromise.prototype.fulfill.bind(this);
  this.reject = MPromise.prototype.reject.bind(this);
}

/*!
 * event names
 */

Promise.SUCCESS = 'success';
Promise.FAILURE = 'error';

/**
 * Inherits from MPromise.
 */

Promise.prototype.__proto__ = MPromise.prototype;

Promise.prototype.listeners = function (type) {
  switch (type) {
    case Promise.SUCCESS:
      return this.emitter.listeners(MPromise.SUCCESS)
      break;
    case Promise.FAILURE:
      return this.emitter.listeners(MPromise.FAILURE)
    default:
      return this.emitter.listeners(type)
  }
}

/**
 * Each method
 *
 * @api public
 */

Promise.prototype.each = function (fn) {
  if (fn) {
    this.on('each', fn);
  }
  return this;
};

/**
 * Destroys the promise.
 *
 * @api public
 */

Promise.prototype.destroy = function(){
  this.emit('destroy');
  var self = this;
  immediately(function(){
    // null the query ref
    delete self.query;
  });
};

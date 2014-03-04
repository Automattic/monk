
/**
 * Module dependencies.
 */

var MPromise = require('mpromise');

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
  this.onResolve(this.emit.bind(this,'complete'));

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
  process.nextTick(function(){
    // null the query ref
    delete self.query;
  });
};

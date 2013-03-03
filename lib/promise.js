
/**
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter;

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
  this.completed = false;
  this.opts = opts || {};

  // complete event
  var self = this;
  this.once('error', function (err) {
    if (self.completed) return;
    self.emit('complete', err);
  });
  this.once('success', function (data) {
    if (self.completed) return;
    self.emit('complete', null, data);
    process.nextTick(function(){
      // null the query ref
      delete self.query;
    });
  });

  // for practical purposes
  this.fulfill = this.fulfill.bind(this);
}

/**
 * Inherits from EventEmitter.
 */

Promise.prototype.__proto__ = EventEmitter.prototype;

/**
 * Map methods to events.
 */

['each', 'error', 'success', 'complete'].forEach(function (method) {
  Promise.prototype[method] = function (fn) {
    if (fn) {
      this.on(method, fn);
    }
    return this;
  };
});

/**
 * Fulfills the promise.
 *
 * @api public
 */

Promise.prototype.fulfill = function (err, data) {
  this.fulfilled = true;
  if (err) {
    this.emit('error', err);
  } else {
    this.emit('success', data);
  }
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

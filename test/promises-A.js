/**
 * Module dependencies.
 */

var Promise = require('../lib/monk').Promise;
var aplus = require('promises-aplus-tests');

var adapter = {
  deferred: function () {
    var p = new Promise();
    return {
      promise: p,
      reject: p.reject,
      resolve: p.fulfill
    };
  }
};

describe("Promises/A+ Tests", function () {
  aplus.mocha(adapter);
});

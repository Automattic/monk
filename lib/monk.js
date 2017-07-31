
/*
 * Module exports
 */
var manager = require('./manager')
module.exports = exports = manager
exports.default = manager
exports.manager = manager

/*
 * Expose Collection
 */

exports.Collection = require('./collection')

/*
 * Expose helpers at the top level
 */

var helpers = require('./helpers')

for (var key in helpers) {
  exports[key] = helpers[key]
}

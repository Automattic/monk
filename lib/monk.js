
/*
 * Module exports.
 */

module.exports = exports = require('./manager')

/*
 * Expose Collection.
 *
 * @api public
 */

exports.Collection = require('./collection')

/*
 * Expose util.
 *
 * @api public
 */

exports.util = require('./util')

/*
 * Expose helpers at the top level
 */

var helpers = require('./helpers')

for (var key in helpers) {
  exports[key] = helpers[key]
}

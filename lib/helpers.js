var ObjectId = require('mongodb').ObjectID

/**
 * Casts to objectid
 *
 * @param {Mixed} str - hex id or ObjectId
 * @return {ObjectId}
 * @api public
 */

exports.id = function (str) {
  if (str == null) return ObjectId()
  return typeof str === 'string' ? ObjectId.createFromHexString(str) : str
}

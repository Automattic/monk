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

/**
 * Applies ObjectId casting to _id fields.
 *
 * @param {Object} optional, query
 * @return {Object} query
 * @private
 */

exports.cast = function cast (obj) {
  if (Array.isArray(obj)) {
    return obj.map(cast)
  }

  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach(function (k) {
      if (k === '_id' && obj._id) {
        if (obj._id.$in) {
          obj._id.$in = obj._id.$in.map(exports.id)
        } else if (obj._id.$nin) {
          obj._id.$nin = obj._id.$nin.map(exports.id)
        } else if (obj._id.$ne) {
          obj._id.$ne = exports.id(obj._id.$ne)
        } else {
          obj._id = exports.id(obj._id)
        }
      } else {
        obj[k] = cast(obj[k])
      }
    })
  }

  return obj
}

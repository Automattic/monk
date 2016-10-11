var id = require('./helpers').id

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
          obj._id.$in = obj._id.$in.map(id)
        } else if (obj._id.$nin) {
          obj._id.$nin = obj._id.$nin.map(id)
        } else if (obj._id.$ne) {
          obj._id.$ne = id(obj._id.$ne)
        } else {
          obj._id = id(obj._id)
        }
      } else {
        obj[k] = cast(obj[k])
      }
    })
  }

  return obj
}

/**
 * Check if the query is an id and if so, transform it to a proper query
 *
 * @param {String|ObjectId|Object} query
 * @return {Object} query
 * @private
 */

exports.query = function (query) {
  query = query || {}

  if (typeof query === 'string' || typeof query.toHexString === 'function') {
    return {_id: query}
  }

  return query
}

/**
 * Parses all the possible ways of expressing fields.
 *
 * @param {String|Object|Array} fields
 * @param {number} number when -
 * @return {Object} fields in object format
 * @private
 */

exports.fields = function (obj, numberWhenMinus) {
  if (!Array.isArray(obj) && typeof obj === 'object') {
    return obj
  }

  var fields = {}
  obj = typeof obj === 'string' ? obj.split(' ') : (obj || [])

  for (var i = 0, l = obj.length; i < l; i++) {
    if (obj[i][0] === '-') {
      fields[obj[i].substr(1)] = numberWhenMinus
    } else {
      fields[obj[i]] = 1
    }
  }

  return fields
}

/**
 * Parses an object format.
 *
 * @param {String|Array|Object} fields or options
 * @return {Object} options
 * @private
 */

exports.options = function (opts) {
  if (typeof opts === 'string' || Array.isArray(opts)) {
    return { fields: exports.fields(opts) }
  }
  opts = opts || {}
  opts.fields = exports.fields(opts.fields, 0)
  opts.sort = exports.fields(opts.sort, -1)
  return opts
}

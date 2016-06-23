/**
 * Callback for a mongo query
 *
 * @param {Function} resolve the promise
 * @param {Function} reject the promise
 * @param {Function} fn - optional callback passed to the query
 * @param {Function} middleware to parse the error and result and the query
 *                   before passing them to the callback
 * @api public
 */
exports.callback = function (resolve, reject, fn, middleware) {
  if (!middleware) {
    middleware = function (err, res, next) {
      return next(err, res)
    }
  }
  return function (err, res) {
    return middleware(err, res, function (parsedErr, parsedRes) {
      if (fn && typeof fn === 'function') {
        fn(parsedErr, parsedRes)
      }
      if (parsedErr) {
        return reject(parsedErr)
      }
      return resolve(parsedRes)
    })
  }
}

/**
 * Parses all the possible ways of expressing fields.
 *
 * @param {String|Object|Array} fields
 * @param {number} number when -
 * @return {Object} fields in object format
 * @api public
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
 * @api public
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

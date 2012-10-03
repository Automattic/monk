
/**
 * Parses all the possible ways of expressing fields.
 *
 * @param {String|Object|Array} fields
 * @return {Object} fields in object format
 * @api public
 */

exports.fields = function (obj) {
  if (!Array.isArray(obj) && 'object' == typeof obj) {
    return obj;
  }

  var fields = {};
  obj = 'string' == typeof obj ? obj.split(' ') : (obj || []);

  for (var i = 0, l = obj.length; i < l; i++) {
    if ('-' == obj[i][0]) {
      fields[obj[i].substr(1)] = 0;
    } else {
      fields[obj[i]] = 1;
    }
  }

  return fields;
};

/**
 * Parses an object format.
 *
 * @param {String|Array|Object} fields or options
 * @return {Object} options
 * @api public
 */

exports.options = function (opts) {
  if ('string' == typeof opts || Array.isArray(opts)) {
    return { fields: exports.fields(opts) };
  }
  opts = opts || {};
  opts.fields = exports.fields(opts.fields);
  return opts;
};

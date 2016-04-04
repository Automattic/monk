
/**
 * Parses all the possible ways of expressing fields.
 *
 * @param {String|Object|Array} fields
 * @return {Object} fields in object format
 * @api public
 */

exports.fields = function (obj) {
  var objType = typeof obj;
  if (!Array.isArray(obj) && 'object' === objType) {
    return obj;
  }

  obj = 'string' === objType ? obj.split(' ') : (obj || []);

  return obj.reduce(function (fields, val) {
    if ('-' === val[0]) {
      fields[val.substr(1)] = 0;
    } else {
      fields[val] = 1;
    }
    return fields;
  }, {});
};

/**
 * Parses an object format.
 *
 * @param {String|Array|Object} fields or options
 * @return {Object} options
 * @api public
 */

exports.options = function (opts) {
  if ('string' === typeof opts || Array.isArray(opts)) {
    return { fields: exports.fields(opts) };
  }
  opts = opts || {};
  opts.fields = exports.fields(opts.fields);
  return opts;
};

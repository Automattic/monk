function fields (obj, numberWhenMinus) {
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

module.exports = function optionsMiddleware (context) {
  return function (next) {
    return function (args, method) {
      var collection = context.collection
      if (typeof args.options === 'string' || Array.isArray(args.options)) {
        args.options = { fields: fields(args.options) }
        return next(args, method)
      }
      args.options = args.options || {}
      if (args.options.fields) {
        args.options.fields = fields(args.options.fields, 0)
      }
      if (args.options.sort) {
        args.options.sort = fields(args.options.sort, -1)
      }

      for (var j in collection.options) {
        if (!(j in args.options)) {
          args.options[j] = collection.options[j]
        }
      }
      return next(args, method)
    }
  }
}

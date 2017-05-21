module.exports = function fieldsMiddleware (context) {
  return function (next) {
    return function (args, method) {
      if (!args.fields) {
        return next(args, method)
      }

      if (!Array.isArray(args.fields) && typeof args.fields === 'object') {
        return next(args, method)
      }

      var fields = {}
      args.fields = typeof args.fields === 'string' ? args.fields.split(' ') : (args.fields || [])

      for (var i = 0, l = args.fields.length; i < l; i++) {
        fields[args.fields[i]] = 1
      }

      args.fields = fields
      return next(args, method)
    }
  }
}

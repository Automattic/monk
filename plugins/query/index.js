module.exports = function queryMiddleware (context) {
  return function (next) {
    return function (args, method) {
      if (!args.query) {
        return next(args, method)
      }

      if (typeof args.query === 'string' || typeof args.query.toHexString === 'function') {
        args.query = {_id: args.query}
      }

      return next(args, method)
    }
  }
}

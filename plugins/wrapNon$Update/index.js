module.exports = function wrapeNon$UpdateMiddleware (context) {
  return function (next) {
    return function (args, method) {
      if ((args.options || {}).wrapNon$UpdateField !== true || !args.update) {
        return next(args, method)
      }

      if (Object.keys(args.update).some(function (k) {
        return k.indexOf('$') !== 0
      })) {
        args.update = {$set: args.update}
      }

      return next(args, method)
    }
  }
}

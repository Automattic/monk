module.exports = function castIdsMiddleware (fieldsToCast) {
  return function (context) {
    return function (next) {
      return function (args, method) {
        if ((args.options || {}).castIds === false) {
          return next(args, method)
        }

        fieldsToCast.forEach(function (k) {
          if (args[k]) {
            args[k] = context.monkInstance.cast(args[k])
          }
        })

        return next(args, method)
      }
    }
  }
}

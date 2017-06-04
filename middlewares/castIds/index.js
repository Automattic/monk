module.exports = function castIdsMiddleware (fieldsToCast) {
  return function (context) {
    return function (next) {
      return function (args, method) {
        if ((args.options || {}).castIds === false) {
          delete args.options.castIds
          return next(args, method)
        }

        if ((args.options || {}).castIds) {
          delete args.options.castIds
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

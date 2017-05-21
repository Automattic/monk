module.exports = function waitForConnection (context) {
  return function (next) {
    return function (args, method) {
      return context.monkInstance.executeWhenOpened().then(function (db) {
        return db.collection(context.collection.name)
      }).then(function (col) {
        args.col = col
        return next(args, method)
      })
    }
  }
}

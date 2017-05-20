module.exports = function (fieldsToCast) {
  return function (args) {
    var options = args.options
    if ((options || {}).castIds === false) {
      return
    }

    var update = {}

    fieldsToCast.forEach(function (k) {
      if (args[k]) {
        update[k] = args.helpers.cast(args[k])
      }
    })

    return update
  }
}

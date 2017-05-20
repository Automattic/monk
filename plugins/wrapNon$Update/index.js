module.exports = function (args) {
  var options = args.options
  if ((options || {}).wrapNon$UpdateField !== true || !args.update) {
    return
  }

  if (Object.keys(args.update).some(function (k) {
    return k.indexOf('$') !== 0
  })) {
    return {
      update: {$set: args.update}
    }
  }
}

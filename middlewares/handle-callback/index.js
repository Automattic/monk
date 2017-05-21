function thenFn (fn) {
  return function (res) {
    if (fn && typeof fn === 'function') {
      fn(null, res)
    }
    return res
  }
}

function catchFn (fn) {
  return function (err) {
    if (fn && typeof fn === 'function') {
      return fn(err) // do not throw if there is a callback
    }
    throw err
  }
}

module.exports = function handleCallback (context) {
  return function (next) {
    return function (args, method) {
      return next(args, method).then(thenFn(args.callback)).catch(catchFn(args.callback))
    }
  }
}

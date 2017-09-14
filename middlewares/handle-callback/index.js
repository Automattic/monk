function thenFn (fn) {
  return function (res) {
    if (fn && typeof fn === 'function') {
      setTimeout(fn, 0, null, res)
    }
    return res
  }
}

function catchFn (fn) {
  return function (err) {
    if (fn && typeof fn === 'function') {
      setTimeout(fn, 0, err)
      return
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

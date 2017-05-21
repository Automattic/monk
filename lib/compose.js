/**
 * Composes single-argument functions from right to left. The rightmost
 * function can take multiple arguments as it provides the signature for
 * the resulting composite function.
 *
 * @param {...Function} funcs The functions to compose.
 * @returns {Function} A function obtained by composing the argument functions
 * from right to left. For example, compose(f, g, h) is identical to doing
 * (args) => f(g(h(args))).
 */

module.exports = function compose (funcs) {
  if (funcs.length === 0) {
    return function (args) { return args }
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce(function (a, b) {
    return function (args) {
      return a(b(args))
    }
  })
}

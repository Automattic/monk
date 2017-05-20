module.exports = function (args) {
  if (!args.query) {
    return
  }

  if (typeof args.query === 'string' || typeof args.query.toHexString === 'function') {
    return {
      query: {_id: args.query}
    }
  }
}

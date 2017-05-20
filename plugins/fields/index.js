module.exports = function (args) {
  if (!args.fields) {
    return
  }

  if (!Array.isArray(args.fields) && typeof args.fields === 'object') {
    return
  }

  var fields = {}
  args.fields = typeof args.fields === 'string' ? args.fields.split(' ') : (args.fields || [])

  for (var i = 0, l = args.fields.length; i < l; i++) {
    fields[args.fields[i]] = 1
  }

  return {
    fields: fields
  }
}

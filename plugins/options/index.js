function fields (obj, numberWhenMinus) {
  if (!Array.isArray(obj) && typeof obj === 'object') {
    return obj
  }

  var fields = {}
  obj = typeof obj === 'string' ? obj.split(' ') : (obj || [])

  for (var i = 0, l = obj.length; i < l; i++) {
    if (obj[i][0] === '-') {
      fields[obj[i].substr(1)] = numberWhenMinus
    } else {
      fields[obj[i]] = 1
    }
  }

  return fields
}

module.exports = function (args) {
  var options = args.options
  var manager = args.manager
  var collection = args.collection
  if (typeof options === 'string' || Array.isArray(options)) {
    return {
      options: { fields: fields(options) }
    }
  }
  options = options || {}
  options.fields = fields(options.fields, 0)
  options.sort = fields(options.sort, -1)

  for (var i in manager.options) {
    if (!(i in options) && !(i in collection.options)) {
      options[i] = manager.options[i]
    }
  }

  for (var j in collection.options) {
    if (!(j in options)) {
      options[j] = collection.options[j]
    }
  }
  return {
    options: options
  }
}

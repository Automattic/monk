const mongoskin = require('mongoskin')
const debug = require('debug')('monk:manager')
const Collection = require('./collection')
const {ObjectId} = mongoskin
const {EventEmitter} = require('events')

class Manager extends EventEmitter {
  /**
   * Manager constructor.
   *
   * @param {Array|String} connection uri. replica sets can be an array or
   * comma-separated
   * @param {Object|Function} options or connect callback
   * @param {Function} connect callback
   */
  constructor (uri, opts, fn) {
    super()
    if (!uri) {
      throw Error('No connection URI provided.')
    }

    if (!(this instanceof Manager)) {
      return new Manager(uri, opts, fn)
    }

    if (typeof opts === 'function') {
      fn = opts
      opts = {}
    }

    opts = opts || {}
    opts.safe = true

    if (Array.isArray(uri)) {
      if (!opts.database) {
        for (let i = 0, l = uri.length; i < l; i++) {
          if (!opts.database) {
            opts.database = uri[i].replace(/([^\/])+\/?/, '')
          }
          uri[i] = uri[i].replace(/\/.*/, '')
        }
      }
      uri = uri.join(',') + '/' + opts.database
      debug('repl set connection "%j" to database "%s"', uri, opts.database)
    }

    if (typeof uri === 'string') {
      if (!/^mongodb:\/\//.test(uri)) {
        uri = 'mongodb://' + uri
      }
    }

    this.driver = mongoskin.db(uri, opts)
    this.helper = mongoskin.helper
    this.helper.id = ObjectId
    this.driver.open(this.onOpen.bind(this))
    this.collections = {}
    this.options = { safe: true }

    this.close = this.close.bind(this)
    this.col = this.get = this.get.bind(this)
    this.oid = this.id = this.id.bind(this)

    if (fn) {
      this.once('open', fn)
    }
  }

  /**
   * Open callback.
   *
   * @api private
   */
  onOpen () {
    this.emit('open')
  }

  /**
   * Closes the connection.
   *
   * @return {Manager} for chaining
   * @api private
   */
  close (fn) {
    this.driver.close(fn)
    return this
  }

  /**
   * Gets a collection.
   *
   * @return {Collection} collection to query against
   * @api private
   */
  get (name) {
    if (!this.collections[name]) {
      this.collections[name] = new Collection(this, name)
    }

    return this.collections[name]
  };

  /**
   * Casts to objectid
   *
   * @param {Mixed} hex id or ObjectId
   * @return {ObjectId}
   * @api public
   */
  id (str) {
    if (str == null) return ObjectId()
    return typeof str === 'string' ? ObjectId.createFromHexString(str) : str
  }
}

/**
 * Module exports.
 */

module.exports = Manager

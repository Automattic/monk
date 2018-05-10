6.0.6 / 2018-05-10
=================
  - Change existing function declarations from properties to functions in order to be able to supply additional typescript definitions to handle a callback scenario

6.0.5 / 2017-10-06
=================
  - Make `monk.get('collection')` a typescript template so that every methods have more specific types
  - Make some types more specifics (`createIndex`, `drop`, `dropIndex`, `dropIndexes`, `indexes`, `remove`, `stats`, `update`)

6.0.4 / 2017-09-11
=================
  - Fix typescript types for `find` (fix #224)

6.0.3 / 2017-07-31
=================
  - Really export Manager as `default` as well

6.0.2 / 2017-07-31
=================
  - Fix typescript types
  - Export Manager as `default` as well

6.0.1 / 2017-06-22
=================
  - Fix typo in `update` method name

6.0.0 / 2017-06-04
==================
  - Add typescript definition (fix #204)
  - return null when findOneAnd... find nothing (fix #175)
  - `remove` now uses `deleteOne` or `deleteMany` under the hood (fix #178)
  - Add `mapReduce` method (fix #167)
  - Add `geoHaystackSearch` method
  - Add `geoNear` method
  - Add `stats` method (fix #191)
  - Remove monk specific options used by middleware (fix #203)
  - The only option set globally is `castIds`. `safe` is not `true` by default anymore.
  - Return the cursor in a promise (when using the `rawCursor` on the `find` method) so that the entire API has the same return type (a promise)

5.0.2 / 2017-05-22
==================
  - Emit event from the manager from the underlying db emits an event (fix #189)

5.0.1 / 2017-05-21
==================
  - Fix typo on requesting middlewares

5.0.0 / 2017-05-21
==================
  - Remove deprecated methods
  - Middleware architecture! See https://automattic.github.io/monk/docs/middlewares.html for more information

4.1.0 / 2017-05-20
==================
  - Update dev dependencies - Thanks @ratson(◕ᴥ◕)
  - Add `collection.createIndex` and deprecate `collection.index` and `collection.ensureIndex`

4.0.0 / 2017-02-13
==================
  - Remove default `safe` option (fix #180)

3.1.4 / 2017-01-30
==================
  - delete wrong options for ensureIndex (fix #174) Thanks @kos984

3.1.3 / 2016-10-12
==================
  - Added a check to ensure no crash in `cast()`` when `_id` is undefined (fix #165) Thanks @JoelParke

3.1.2 / 2016-08-22
==================
  - Fix `collection.count` and `collection.distinct` are ignoring options (fix #159)

3.1.1 / 2016-07-29
==================
  - Provide option to not cache collections (fix #21)

3.1.0 / 2016-07-22
==================
  - Add `Collection.group` (fix #63)
  - Add `Collection.bulkWrite` (fix #85)
  - Pipe `mongodb.Logger` to `debug` (fix #143)

3.0.7 / 2016-07-14
==================
  - Wait for the last 'each' (in `find`) to `resume` or `close` before resolving the promise

3.0.6 / 2016-07-11
==================
  - Fix when casting `null`

3.0.5 / 2016-07-11
==================
  - Fix when updating with `0`

3.0.4 / 2016-07-07
==================
  - Do not fail when inserting empty array

3.0.3 / 2016-07-06
==================
  - Cast `_id` recursively (fix #3)

3.0.2 / 2016-07-06
==================
  - Fix find cursor close when already paused

3.0.1 / 2016-07-06
==================
  - Fix find cursor pause and resume

3.0.0 / 2016-07-06
==================
  - remove Mongoskin dependency
  - new documentation using gitbook
  - add `opts` arg to `Collection.count` and `collection.distinct`
  - deprecate `Collection.removeById`, `Collection.findById`, `Collection.updateById` in favor of using `remove`, `findOne` and `update` directly
  - deprecate `collection.id` and `manager.id` in favor of `monk.id`
  - `monk('localhost')` can be used as a promise which resolves when the connection opens and rejects when it throws an error (fix #24, fix #10)
  - deprecate `Collection.findAndModify` in favor of `Collection.findOneAndDelete` and `Collection.findOneAndUpdate` (fix #74)
  - add `Manager.create` (fix #50)
  - add option `rawCursor` to `Collection.find` to return the raw cursor (fix #103)

2.1.0 / 2016-06-24
==================
 - add aggregate method (#56)
 - add dropIndex and dropIndexes methods (#113)
 - use `util.inherits` instead of `__proto__`
 - Add `castIds` option to disable the automatic id casting (#1, #72)


2.0.1 / 2016-06-24
==================
 - Safer insert (#137)

2.0.0 / 2016-06-23
==================
complete rewrite of monk:
 - return real promises (#104)
 - update mongoskin and mongodb (#111)
 - auto binding of the methods
 - eslint
 - test coverage
 - Support $ne, $in, $nin for id casting
 - Make the sort option behave like fields
 - `Collection.update` now return an object:

    ```
    {
      n: number of matched documents,
      nModified: number of modified documents,
      nUpserted: number of upserted documents
    }
    ```

1.0.1 / 2015-03-25
==================

  * upgrade; mongoskin to 1.4.13

0.9.2 / 2015-02-28
==================

 * mongoskin: bump to 1.4.11
 * Inserting an array returns an array
 * Cast oids inside of $nor queries
 * Cast object ids inside of $or and $and queries
 * Cast object ids inside of $not queries
 * Added a missing test for updateById
 * Added removeById
 * Use `setImmediate` on node 0.10.x

0.9.1 / 2014-11-15
==================

 * update mongoskin to 1.4.4

0.9.0 / 2014-05-09
==================

 * addition of `close()` method
 * updaet mongoskin 1.4.1
 * fixed URL parsing of replsets
 * freezed mpromise version
 * fixed collection distinct after rebase
 * reimplemented Monk.Promise with MPromise.

0.8.1 / 2014-03-01
==================

 * fix for parameter handling in `findAndModify`
 * check for `uri` parameter or throw

0.8.0 / 2014-03-01
==================

 * added `distinct` support (fixes #52)
 * added `Promise#then`

0.7.1 / 2013-03-03
==================

  * promise: expose `query`

0.7.0 / 2012-10-30
==================

  *: bumped `mongoskin` and therefore `node-mongodb-native`

0.6.0 / 2012-10-29
==================

  * collection: added cursor closing support
  * promise: introduce #destroy
  * test: added cursor destroy test

0.5.0 / 2012-10-03
==================

  * promise: added opts to constructor
  * util: fix field negation
  * test: added test for promise options
  * collection: pass options to promises

0.4.0 / 2012-10-03
==================

  * added travis
  * manager: added Manager#id and Manager#oid
  * collection: introduced Collection#oid
  * manager: added Manager#col

0.3.0 / 2012-09-06
==================

  * collection: make `findAndModify` accept an oid as the query

0.2.1 / 2012-07-14
==================

  * collection: fixed streaming when options are not supplied

0.2.0 / 2012-07-14
==================

  * collection: added `count`

0.1.15 / 2012-07-14
===================

  * collection: avoid mongoskin warn when buffering commands

0.1.14 / 2012-07-09
===================

  * Use any debug. [visionmedia]
  * Use any mocha. [visionmedia]

0.1.13 / 2012-05-28
===================

  * Fixed string-based field selection.

0.1.12 / 2012-05-25
===================

  * Added package.json tags.
  * Added support for update with ids (fixes #4)

0.1.11 / 2012-05-22
===================

  * Added support for new objectids through `Collection#id`

0.1.10 / 2012-05-21
===================

  * Enhanced findAndModify default behavior for upserts.
  * Fixed findAndModify.

0.1.9 / 2012-05-16
==================

  * Bumped mongoskin

0.1.8 / 2012-05-12
==================

  * Fixed mongoskin version
  * Improved options docs section.

0.1.7 / 2012-05-08
==================

  * Added global and collection-level options.
  * Enabled safe mode by default.
  * Improved error handling in tests.
  * Fixed `update` callback with safe: false.

0.1.6 / 2012-05-06
==================

  * Added tests for `findById`.

0.1.5 / 2012-05-06
==================

  * Added `Collection` references to `Promise`s.
  * Fixed `findAndModify`.

0.1.4 / 2012-05-06
==================

  * Ensured insert calls back with a single object.
  * Ensured `insert` resolves promise in next tick.

0.1.3 / 2012-05-03
==================

  * Exposed `util`

0.1.2 / 2012-05-03
==================

  * Make `Collection` inherit from `EventEmitter`.

0.1.1 / 2012-04-27
==================

  * Added `updateById`.

0.1.0 / 2012-04-23
==================

  * Initial release.

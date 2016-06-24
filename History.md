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

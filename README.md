# monk

[![build status](https://secure.travis-ci.org/Automattic/monk.png?branch=master)](https://secure.travis-ci.org/Automattic/monk)
[![codecov](https://codecov.io/gh/Automattic/monk/branch/master/graph/badge.svg)](https://codecov.io/gh/Automattic/monk)

Monk is a tiny layer that provides simple yet substantial usability
improvements for MongoDB usage within Node.JS.

*note*: monk 2.x drop the support for node < 0.12. If you are still using an earlier version, stick to monk 1.x

```js
const db = require('monk')('localhost/mydb')
const users = db.get('users')

users.index('name last')
users.insert({ name: 'Tobi', bigdata: {} })
users.find({ name: 'Loki' }, '-bigdata').then(function () {
  // exclude bigdata field
})
users.find({}, {sort: {name: 1}}).then(function () {
  // sorted by name field
})
users.remove({ name: 'Loki' })

db.close()
```

## Features

- Command buffering. You can start querying right away.
- Promises built-in for all queries. Easy interoperability with modules.
- Easy connections / configuration
- Well-designed signatures
- Improvements to the MongoDB APIs (eg: `findAndModify` supports the
  `update` signature style)
- Auto-casting of `_id` in queries
- Builds on top of [mongoskin](http://github.com/kissjs/node-mongoskin)
- Allows to set global options or collection-level options for queries. (eg:
  `safe` is `true` by default for all queries)

## How to use

### Connecting

#### Single server

```js
const db = require('monk')('localhost/mydb', options)
```

#### Replica set

```js
const db = require('monk')('localhost/mydb,192.168.1.1')
```

### Disconnecting

```js
db.close()
```

### Collections

#### Getting one

```js
const users = db.get('users')
// users.insert(), users.update() … (see below)
```

#### Dropping

```js
users.drop(fn)
```

### Signatures

- All commands accept the simple `data[, …][, callback]`. For example
    - `find({}, fn)`
    - `findOne({}, fn)`
    - `update({}, {}, fn)`
    - `findAndModify({}, {}, fn)`
    - `findById('id', fn)`
    - `remove({}, fn)`
- You can pass options in the middle: `data[, …], options[, fn]`
- You can pass fields to select as an array: `data[, …], ['field', …][, fn]`
- You can pass fields as a string delimited by spaces:
  `data[, …], 'field1 field2'[, fn]`
- To exclude a field, prefix the field name with '-':
  `data[, …], '-field1'[, fn]`
- You can pass sort option the same way as fields

### Promises

All methods that perform an async action return a promise.

```js
users.insert({}).then((doc) => {
  // success
}).catch((err) => {
  // error
})
```

### Indexes

```js
users.index('name.first')
users.index('email', { unique: true }) // unique
users.index('name.first name.last') // compound
users.index({ 'email': 1, 'password': -1 }) // compound with sort
users.index('email', { sparse: true }) // with options
users.indexes() // get indexes
users.dropIndex(name) // drop an index
users.dropIndexes() // drop all indexes
```

### Inserting

```js
users.insert({ a: 'b' })
```

### Casting

To cast to `ObjectId`:

```js
users.id() // returns new generated ObjectID
users.id('hexstring') // returns ObjectId
users.id(obj) // returns ObjectId
```

### Updating

```js
users.update({}, {})
users.updateById('id', {})
```

### Finding

#### Many

```js
users.find({}).then((docs) => {})
```

#### By ID

```js
users.findById('hex representation').then((doc) => {})
users.findById(oid).then((doc) => {})
```

#### Single doc

`findOne` also provides the `findById` functionality.

```js
users.findOne({ name: 'test' }).then((doc) => {})
```

#### And modify

```js
users.findAndModify({ query: {}, update: {} })
users.findAndModify({ _id: '' }, { $set: {} }, { new: true })
```

#### Streaming

Note: `stream: true` is optional if you register an `each` handler in the
same tick. In the following example I just include it for extra clarity.

```js
users.find({}, { stream: true })
  .each((doc, destroy) => {})
  .then(() => {})
  .catch((err) => {})
```

##### Destroying a cursor

You can call `destroy()` in the `each` handler to close the cursor. Upon the cursor
closing the `then` handler will be called.

### Removing

```js
users.remove({ a: 'b' })
```

### Aggregate

```js
users.aggregate(stages, {})
```

### Global options

```js
const db = require('monk')('localhost/mydb')
db.options.multi = true // global multi-doc update
db.get('users').options.multi = false // collection-level
```

Monk sets `safe` to `true` by default.

### Query debugging

If you wish to see what queries `monk` passes to the driver, simply leverage
[debug](http://github.com/visionmedia/debug):

```bash
DEBUG="monk:queries"
```

To see all debugging output:

```bash
DEBUG="monk:*"
```

## Contributors

- [Guillermo Rauch](http://github.com/rauchg)
- [Travis Jeffery](http://github.com/travisjeffery)
- [Mathieu Dutour](http://github.com/mathieudutour)

## License

(The MIT License)

Copyright (c) 2012 Guillermo Rauch &lt;guillermo@learnboost.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

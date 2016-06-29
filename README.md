# monk

[![build status](https://secure.travis-ci.org/Automattic/monk.png?branch=master)](https://secure.travis-ci.org/Automattic/monk)
[![codecov](https://codecov.io/gh/Automattic/monk/branch/master/graph/badge.svg)](https://codecov.io/gh/Automattic/monk)
[![Join the chat at https://gitter.im/Automattic/monk](https://badges.gitter.im/Automattic/monk.svg)](https://gitter.im/Automattic/monk?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Monk is a tiny layer that provides simple yet substantial usability
improvements for MongoDB usage within Node.JS.

_note_: monk 2.x drop the support for node &lt; 0.12. If you are still using an earlier version, stick to monk 1.x

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

-   Command buffering. You can start querying right away.
-   Promises built-in for all queries. Easy interoperability with modules.
-   Easy connections / configuration
-   Well-designed signatures
-   Improvements to the MongoDB APIs (eg: `findAndModify` supports the
    `update` signature style)
-   Auto-casting of `_id` in queries
-   Builds on top of [mongoskin](http://github.com/kissjs/node-mongoskin)
-   Allows to set global options or collection-level options for queries. (eg:
    `safe` is `true` by default for all queries)

### Signatures

-   All commands accept the simple `data[, …][, callback]`. For example
    -   `find({}, fn)`
    -   `findOne({}, fn)`
    -   `update({}, {}, fn)`
    -   `findAndModify({}, {}, fn)`
    -   `findById('id', fn)`
    -   `remove({}, fn)`
-   You can pass options in the middle: `data[, …], options[, fn]`
-   You can pass fields to select as an array: `data[, …], ['field', …][, fn]`
-   You can pass fields as a string delimited by spaces:
    `data[, …], 'field1 field2'[, fn]`
-   To exclude a field, prefix the field name with '-':
    `data[, …], '-field1'[, fn]`
-   You can pass sort option the same way as fields

### Promises

All methods that perform an async action return a promise.

```js
users.insert({}).then((doc) => {
  // success
}).catch((err) => {
  // error
})
```

## API

### Manager

Monk constructor.

**Parameters**

-   `uri` **([Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) \| [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String))** replica sets can be an array or
    comma-separated
-   `opts` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function))** or connect callback
-   `fn` **[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)** connect callback

**Examples**

```javascript
const db = require('monk')('localhost/mydb', options)
```

```javascript
const db = require('monk')('localhost/mydb,192.168.1.1') // replica set
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** resolve when the connection is opened

#### close

Closes the connection.

**Parameters**

-   `Function`  {fn} - callback
-   `fn`  

**Examples**

```javascript
db.close()
```

Returns **Manager** for chaining

#### get

Gets a collection.

**Parameters**

-   `name` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** name of the mongo collection

**Examples**

```javascript
const users = db.get('users')
```

Returns **Collection** collection to query against

#### id

Casts to objectid

**Parameters**

-   `str` **Mixed** hex id or ObjectId

Returns **ObjectId** 

### Collection

Mongo Collection.

**Parameters**

-   `manager`  
-   `name`  

#### ensureIndex

Creates indexes on collections.

<https://docs.mongodb.com/manual/reference/method/db.collection.ensureIndex/>

**Parameters**

-   `fields` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))** 
-   `opts` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** options
-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** callback

**Examples**

```javascript
users.index('name.first')
users.index('name last')
users.index(['nombre', 'apellido'])
users.index({ up: 1, down: -1 })
users.index({ woot: 1 }, { unique: true })
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### dropIndex

Drops or removes the specified index or indexes from a collection.

<https://docs.mongodb.com/manual/reference/method/db.collection.dropIndex/>

**Parameters**

-   `fields` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))** 
-   `opts` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** 
-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** callback

**Examples**

```javascript
users.dropIndex('name.first')
users.dropIndex('name last')
users.dropIndex(['nombre', 'apellido'])
users.dropIndex({ up: 1, down: -1 })
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### dropIndexes

Drops all indexes other than the required index on the \_id field.

<https://docs.mongodb.com/manual/reference/method/db.collection.dropIndexes/>

**Parameters**

-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** callback

**Examples**

```javascript
users.dropIndexes()
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### indexes

Returns an array that holds a list of documents that identify and describe the existing indexes on the collection.

<https://docs.mongodb.com/manual/reference/method/db.collection.getIndexes/>

**Parameters**

-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** callback

**Examples**

```javascript
users.indexes()
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### update

Modifies an existing document or documents in a collection. The method can modify specific fields of an existing document or documents or replace an existing document entirely, depending on the update parameter. By default, the update() method updates a single document. Set the `multi` option to update all documents that match the query criteria.

<https://docs.mongodb.com/manual/reference/method/db.collection.update/>

**Parameters**

-   `search` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** query
-   `update` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** obj
-   `opts` **\[([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))]** , options or fields
-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** callback

**Examples**

```javascript
users.update({ name: 'Mathieu' }, { $set: { foo: 'bar' } })
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### updateById

update by id helper

**Parameters**

-   `id` **([String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))** object id
-   `update` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** update obj
-   `opts` **\[([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))]** options or fields
-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** callback

**Examples**

```javascript
users.updateById(id, { $set: { foo: 'bar' } })
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### remove

Removes documents from a collection.

<https://docs.mongodb.com/manual/reference/method/db.collection.remove/>

**Parameters**

-   `search` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** query
-   `opts` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** options
-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** callback

**Examples**

```javascript
users.remove({ name: 'Mathieu' })
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### removeById

remove by ID helper

**Parameters**

-   `hex` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** id
-   `id`  
-   `opts` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** options
-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** callback

**Examples**

```javascript
users.removeById(id)
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### findAndModify

Modifies and returns a single document. By default, the returned document does not include the modifications made on the update. To return the document with the modifications made on the update, use the `new` option.

<https://docs.mongodb.com/manual/reference/method/db.collection.findAndModify/>

**Parameters**

-   `search` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** query, or { query, update } object
-   `query`  
-   `update` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** object
-   `opts` **\[([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))]** options or fields
-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** callback

**Examples**

```javascript
users.findAndModify({ name: 'Mathieu' }, { $set: { foo: 'bar' } }, opts)
users.findAndModify({ query: { name: 'Mathieu' }, update: { $set: { foo: 'bar' } }}, opts)
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### insert

Inserts a document or documents into a collection.

<https://docs.mongodb.com/manual/reference/method/db.collection.insert/>

**Parameters**

-   `data` **([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))** 
-   `opts` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** options
-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** callback

**Examples**

```javascript
users.insert({ woot: 'foo' })
users.insert([{ woot: 'bar' }, { woot: 'baz' }])
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### find

Selects documents in a collection and return them.

<https://docs.mongodb.com/manual/reference/method/db.collection.find/>

**Parameters**

-   `query` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `opts` **\[([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))]** options or fields
-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** completion callback

**Examples**

```javascript
users.find({}).then((docs) => {})
```

```javascript
users.find({}).each((user, destroy) => {
  // the users are streaming here
  // call `destroy()` to stop the stream
}).then(() => {
  // stream is over
})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### distinct

Finds the distinct values for a specified field across a single collection and returns the results in an array.

<https://docs.mongodb.com/manual/reference/method/db.collection.distinct/>

**Parameters**

-   `field` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** The field for which to return distinct values.
-   `query` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** A query that specifies the documents from which to retrieve the distinct values.
-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** completion callback

**Examples**

```javascript
users.distinct('name')
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### count

Returns the count of documents that would match a find() query. The db.collection.count() method does not perform the find() operation but instead counts and returns the number of results that match a query.

<https://docs.mongodb.com/manual/reference/method/db.collection.count/>

**Parameters**

-   `query` **[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)** The query selection criteria.
-   `opts` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** Extra options for modifying the count.
-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** completion callback.

**Examples**

```javascript
users.count({name: 'foo'})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### findOne

Returns one document that satisfies the specified query criteria. If multiple documents satisfy the query, this method returns the first document according to the natural order which reflects the order of documents on the disk. In capped collections, natural order is the same as insertion order. If no document satisfies the query, the method returns null.

<https://docs.mongodb.com/manual/reference/method/db.collection.findOne/>

**Parameters**

-   `query` **([String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) | ObjectId | [Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object))** 
-   `search`  
-   `opts` **\[[Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)]** options
-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** completion callback

**Examples**

```javascript
users.findOne({name: 'foo'}).then((doc) => {})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### findById

findOne by ID helper

**Parameters**

-   `hex` **[String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** id
-   `id`  
-   `opts` **\[([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [String](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) \| [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array))]** options or fields
-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** completion callback

**Examples**

```javascript
users.findById(id).then((doc) => {})
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### drop

Removes a collection from the database. The method also removes any indexes associated with the dropped collection.

<https://docs.mongodb.com/manual/reference/method/db.collection.drop/>

**Parameters**

-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** callback

**Examples**

```javascript
users.drop()
```

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### aggregate

Calculates aggregate values for the data in a collection.

<https://docs.mongodb.com/manual/reference/method/db.collection.aggregate/>

**Parameters**

-   `pipeline` **[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)** A sequence of data aggregation operations or stages.
-   `stages`  
-   `opts` **\[([Object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) \| [Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function))]** 
-   `fn` **\[[Function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)]** 

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)** 

#### id

Casts to objectid

**Parameters**

-   `str` **Mixed** hex id or ObjectId

Returns **ObjectId** 

## Contributors

-   [Guillermo Rauch](http://github.com/rauchg)
-   [Travis Jeffery](http://github.com/travisjeffery)
-   [Mathieu Dutour](http://github.com/mathieudutour)

## License

(The MIT License)

Copyright (c) 2012 Guillermo Rauch &lt;guillermo@learnboost.com>

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

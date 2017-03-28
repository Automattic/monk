# Manager

Monk constructor.

#### Arguments

1. `uri` *(string or Array)*: A [mongo connection string URI](https://docs.mongodb.com/manual/reference/connection-string/). Replica sets can be an array or comma separated.

2. [`options`] *(Object)*: You may optionally specify [options](http://mongodb.github.io/node-mongodb-native/2.1/reference/connecting/connection-settings/).

3. [`callback`] *(Function)*: You may optionally specify a callback which will be called once the connection to the mongo database is opened or throws an error.

#### Returns

A Manager instance with the following methods:
  * [close](/close.md)
  * [create](/create.md)
  * [get](/get.md)

#### Example

```js
const db = require('monk')('localhost/mydb', options)
```

```js
const db = require('monk')('localhost/mydb,192.168.1.1') // replica set
```

```js
require('monk')('localhost/mydb,192.168.1.1').then((db) => {
  // db is the connected instance of the Manager
}).catch((err) => {
  // error connecting to the database
})
```

#### Options

You can set options to pass to every query. By default, monk doesn't set any options.

Set options like this:

```js
db.options = {
  poolSize: 7
}
```

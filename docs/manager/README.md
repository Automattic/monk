# Manager

Monk constructor.

#### Arguments

1. `uri` *(string or Array)*: A [mongo connection string URI](https://docs.mongodb.com/manual/reference/connection-string/). Replica sets can be an array or comma separated.

2. [`options`] *(Object)*: You may optionally specify [options](http://mongodb.github.io/node-mongodb-native/2.1/reference/connecting/connection-settings/).

3. [`callback`] *(Function)*: You may optionally specify a callback which will be called once the connection to the mongo database is opened.

#### Returns

A Manager instance with the following methods:
  * [close](/docs/manager/close.md)
  * [get](/docs/manager/get.md)

#### Example

```js
const db = require('monk')('localhost/mydb', options)
```

```js
const db = require('monk')('localhost/mydb,192.168.1.1') // replica set
```

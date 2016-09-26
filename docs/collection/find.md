# `collection.find`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#find)

Selects documents in a collection and return them.

#### Arguments

1. `query` *(String|ObjectId|Object)*

2. [`options`] *(Object|String|Array)*: If the `options` is a string, it will be parsed as the fields to select.
In addition to the mongo options, you can pass the option `rawCursor` in order to get the raw [mongo cursor](http://mongodb.github.io/node-mongodb-native/2.0/api/Cursor.html) when the promise resolve.

3. [`callback`] *(function)*

#### Returns

A promise with a `each` method to stream the query.
The `each` method expects a function which will receive two arguments:
  1. `doc` *(Object)*: current document of the stream
  2. `cursor` *(Object)*:
    * `close` *(function)*: close the stream. The promise will be resolved.
    * `pause` *(function)*: pause the stream.
    * `resume` *(function)*: resume the stream.

#### Example

```js
users.find({}).then((docs) => {})
```
```js
users.find({}, 'name').then((docs) => {
  // only the name field will be selected
})
users.find({}, { fields: { name: 1 } }) // equivalent

users.find({}, '-name').then((docs) => {
  // all the fields except the name field will be selected
})
users.find({}, { fields: { name: 0 } }) // equivalent
```
```js
users.find({}, { rawCursor: true }).then((cursor) => {
  // raw mongo cursor
})
```
```js
users.find({}).each((user, {close, pause, resume}) => {
  // the users are streaming here
  // call `close()` to stop the stream
}).then(() => {
  // stream is over
})
```

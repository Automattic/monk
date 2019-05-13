# `collection.findOne`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/3.2/api/Collection.html#findOne)

Returns one document that satisfies the specified query criteria. If multiple documents satisfy the query, this method returns the first document according to the natural order which reflects the order of documents on the disk. In capped collections, natural order is the same as insertion order. If no document satisfies the query, the method returns null.

#### Arguments

1. `query` *(String|ObjectId|Object)*

2. [`options`] *(Object|String|Array)*: If the `options` is a string, it will be parsed as the fields to select.

3. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
users.findOne({name: 'foo'}).then((doc) => {})
```
```js
users.findOne({name: 'foo'}, 'name').then((doc) => {
  // only the name field will be selected
})
users.findOne({name: 'foo'}, { fields: { name: 1 } }) // equivalent

users.findOne({name: 'foo'}, '-name').then((doc) => {
  // all the fields except the name field will be selected
})
users.findOne({name: 'foo'}, { fields: { name: -1 } }) // equivalent
```

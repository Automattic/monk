# `collection.indexes`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#indexes)

Returns an array that holds a list of documents that identify and describe the existing indexes on the collection.

#### Arguments

1. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
users.indexes().then((indexes) => {})
```

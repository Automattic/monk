# `collection.findOneAndDelete`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#findOneAndDelete)

Find a document and delete it in one atomic operation, requires a write lock for the duration of the operation.

#### Arguments

1. `query` *(String|ObjectId|Object)*

2. [`options`] *(Object|String|Array)*: If the `options` is a string, it will be parsed as the fields to select.

3. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
users.findOneAndDelete({name: 'foo'}).then((doc) => {})
```

# `collection.findOneAndUpdate`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#findOneAndUpdate)

Find a document and update it in one atomic operation, requires a write lock for the duration of the operation.

#### Arguments

1. `query` *(String|ObjectId|Object)*

2. `update` *(Object)*: Update operations to be performed on the document. As [specified in MongoDB Node.js native driver 3.x](https://github.com/mongodb/node-mongodb-native/blob/master/CHANGES_3.0.0.md#updateone--updatemany), you need to specify an atomic operator here (like a `$set`, `$unset`, or `$rename`).

3. [`options`] *(Object|String|Array)*: If the `options` is a string, it will be parsed as the fields to select.

`options.returnOriginal` is default to `false`, while `mongodb` set it to `true` for `undefined`.

4. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
users.findOneAndUpdate({name: 'foo'}, { $set: { name: 'bar'} }).then((updatedDoc) => {})
```

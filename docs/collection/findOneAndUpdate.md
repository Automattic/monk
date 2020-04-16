# `collection.findOneAndUpdate`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/3.2/api/Collection.html#findOneAndUpdate)

Find a document and update it in one atomic operation, requires a write lock for the duration of the operation.

#### Arguments

1. `query` *(String|ObjectId|Object)*

2. `update` *(Object)*: Update operations to be performed on the document. As [written in MongoDB docs](https://docs.mongodb.com/manual/reference/operator/update/), you need to specify an atomic operator here (like a `$set`, `$unset`, or `$rename`).

3. [`options`] *(Object|String|Array)*: If the `options` is a string, it will be parsed as the fields to select.

`options.returnOriginal` is default to `false`, while `mongodb` set it to `true` for `undefined`.

if `options.replaceOne` is `true`, it will work like findOneAndReplace.

4. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
users.findOneAndUpdate({name: 'foo'}, { $set: { name: 'bar'} }).then((updatedDoc) => {})
```

Note that you can also use the [monk-middleware-wrap-non-dollar-update](https://github.com/monk-middlewares/monk-middleware-wrap-non-dollar-update) middleware, which will automatically put the `$set` operator on the `update` argument:

```js
db.addMiddleware(require('monk-middleware-wrap-non-dollar-update'))

users.findOneAndUpdate({name: 'foo'}, { name: 'bar'}).then((updatedDoc) => {})
```

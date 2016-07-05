# `collection.insert`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#insert)

Inserts a single document or a an array of documents into MongoDB.

#### Arguments

1. `docs` *(Object|Array)*

2. [`options`] *(Object)*

3. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
users.insert({ woot: 'foo' })
users.insert([{ woot: 'bar' }, { woot: 'baz' }])
```

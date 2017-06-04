# `collection.remove`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#remove)

Remove documents. Set the `multi` option to false remove only the first document that match the query criteria.

#### Arguments

1. `query` *(Object|ObjectId|String)*

2. [`options`] *(Object)*

3. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
users.remove({ woot: 'foo' })
```

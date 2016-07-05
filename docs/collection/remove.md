# `collection.remove`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#remove)

Remove documents.

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

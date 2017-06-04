# `collection.stats`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#stats)

Get all the collection statistics.

#### Arguments

1. [`options`] *(Object)*

2. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
users.stats().then((stats) => {})
```

# `collection.drop`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/3.2/api/Collection.html#drop)

Drop the collection from the database, removing it permanently. New accesses will create a new collection.

#### Arguments

1. [`callback`] *(function)*

#### Returns

A promise

#### Example

```js
users.drop()
```

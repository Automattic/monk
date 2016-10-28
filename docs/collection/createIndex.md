# `collection.createIndex`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#createIndex)

Creates an index on the db and collection.

#### Arguments

1. `fieldOrSpec` *(String|Array|Object)*: Defines the index.

2. [`options`] *(object)*

3. [`callback`] *(function)*

#### Returns

A promise

#### Example

```js
users.createIndex('name.first')
users.createIndex('name last')
users.createIndex(['nombre', 'apellido'])
users.createIndex({ up: 1, down: -1 })
users.createIndex({ woot: 1 }, { unique: true })
```

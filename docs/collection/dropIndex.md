# `collection.dropIndex`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#dropIndex)

Drops indexes from this collection.

#### Arguments

1. `fields` *(String|Object|Array)*: Defines the index (or indexes) to drop.

2. [`options`] *(object)*

3. [`callback`] *(function)*

#### Returns

A promise

#### Example

```js
users.dropIndex('name.first')
users.dropIndex('name last')
users.dropIndex(['nombre', 'apellido'])
users.dropIndex({ up: 1, down: -1 })
```

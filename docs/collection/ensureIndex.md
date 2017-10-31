# `collection.ensureIndex`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#ensureIndex)

Ensures that indexes exist, if it does not it creates it

#### Arguments

1. `fieldOrSpec` *(String|Array|Object)*: Defines the index.

2. [`options`] *(object)*

3. [`callback`] *(function)*

#### Returns

A promise

#### Example

```js
users.index('name.first')
users.index('name last')
users.index(['nombre', 'apellido'])
users.index({ up: 1, down: -1 })
users.index({ woot: 1 }, { unique: true })

users.ensureIndex('name.first')
users.ensureIndex('name last')
users.ensureIndex(['nombre', 'apellido'])
users.ensureIndex({ up: 1, down: -1 })
users.ensureIndex({ woot: 1 }, { unique: true })
```

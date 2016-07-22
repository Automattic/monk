# `collection.bulkWrite`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#bulkWrite)

Perform a bulkWrite operation without a fluent API

Legal operation types are
```
{ insertOne: { document: { a: 1 } } }
{ updateOne: { filter: {a:2}, update: {$set: {a:2}}, upsert:true } }
{ updateMany: { filter: {a:2}, update: {$set: {a:2}}, upsert:true } }
{ deleteOne: { filter: {c:1} } }
{ deleteMany: { filter: {c:1} } }
{ replaceOne: { filter: {c:3}, replacement: {c:4}, upsert:true}}
```

#### Arguments

1. `operations` *(Array)* - Bulk operations to perform.

2. [`options`] *(Object)*

3. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
users..bulkWrite([
    { insertOne: { document: { a: 1 } } }
  , { updateOne: { filter: {a:2}, update: {$set: {a:2}}, upsert:true } }
  , { updateMany: { filter: {a:2}, update: {$set: {a:2}}, upsert:true } }
  , { deleteOne: { filter: {c:1} } }
  , { deleteMany: { filter: {c:1} } }
  , { replaceOne: { filter: {c:3}, replacement: {c:4}, upsert:true}}
])
```

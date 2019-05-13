# `collection.aggregate`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/3.2/api/Collection.html#aggregate)

Calculates aggregate values for the data in a collection.

#### Arguments

1. `pipeline` *(Array)*: A sequence of data aggregation operations or stages.

2. [`options`] *(object)*

3. [`callback`] *(function)*

#### Returns

A promise

#### Example

```js
users.aggregate([
  { $project : {
    author : 1,
    tags : 1
  }},
  { $unwind : "$tags" },
  { $group : {
    _id : {tags : "$tags"},
    authors : { $addToSet : "$author" }
  }}
]).then((res) => {})
```

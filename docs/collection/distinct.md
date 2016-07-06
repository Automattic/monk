# `collection.distinct`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#distinct)

Finds the distinct values for a specified field across a single collection and returns the results in an array.

#### Arguments

1. `field` *(String)*: The field for which to return distinct values.

2. [`query`] *(String|ObjectId|Object)*: A query that specifies the documents from which to retrieve the distinct values.

3. [`options`] *(object)*

4. [`callback`] *(function)*

#### Returns

A promise

#### Example

```js
users.distinct('name')
```

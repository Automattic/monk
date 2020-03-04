# `collection.estimatedDocumentCount`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/3.2/api/Collection.html#estimatedDocumentCount)

Returns the estimated count of *all* documents in the collection using collection metadata. The `collection.estimatedDocumentCount()` method does not accept query parameters but instead counts and returns the number of estimated documents in the collection. If you need to filter the number of documents with a query, it is recommended to use [count](count.md).

#### Arguments

1. [`options`] *(object)*

2. [`callback`] *(function)*

#### Returns

A promise

#### Example

```js
users.estimatedDocumentCount()
```

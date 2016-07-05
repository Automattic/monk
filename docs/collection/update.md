# `collection.update`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#update)

Modifies an existing document or documents in a collection. The method can modify specific fields of an existing document or documents or replace an existing document entirely, depending on the update parameter. By default, the update() method updates a single document. Set the `multi` option to update all documents that match the query criteria.

#### Arguments

1. `query` *(String|ObjectId|Object)*

2. `update` *(Object)*: Update operations to be performed on the document

3. [`options`] *(Object)*

4. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
users.update({name: 'foo'}, {name: 'bar'})
```

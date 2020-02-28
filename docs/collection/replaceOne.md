# `collection.replaceOne`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](https://docs.mongodb.com/manual/reference/method/db.collection.replaceOne/)

replaceOne() replaces the first matching document in the collection that matches the filter, using the replacement document.

#### Arguments

1. `query` *(String|ObjectId|Object)*

2. `replacement` *(Object)*: The replacement document.

3. [`options`] *(Object)*

4. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
users.replaceOne({name: 'foo'}, {name: 'bar'})
```

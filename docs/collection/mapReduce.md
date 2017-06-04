# `collection.mapReduce`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#mapReduce)

Run Map Reduce across a collection. Be aware that the inline option for out will return an array of results not a collection.

#### Arguments

1. `map` *(function | string)* - The mapping function.

1. `reduce` *(function | string)* - The reduce function.

2. [`options`] *(Object)*

3. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
// Map function
var map = function () { emit(this.user_id, 1) }
// Reduce function
var reduce = function (k, vals) { return 1 }
users.mapReduce(map, reduce, {out: {replace: 'tempCollection'}}).then((collection) => {})
```

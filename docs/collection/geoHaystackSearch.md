# `collection.geoHaystackSearch`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#geoHaystackSearch)

Execute a geo search using a geo haystack index on a collection.

#### Arguments

1. `x` *(number)* - Point to search on the x axis, ensure the indexes are ordered in the same order.

1. `y` *(number)* - Point to search on the y axis, ensure the indexes are ordered in the same order.

1. [`options`] *(Object)*

1. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
users.geoHaystackSearch(50, 50, {search:{a:1}, limit:1, maxDistance:100}).then((results) => {})
```

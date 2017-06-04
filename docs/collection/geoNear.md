# `collection.geoNear`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html#geoNear)

Execute the geoNear command to search for items in the collection.

#### Arguments

1. `x` *(number)* - Point to search on the x axis, ensure the indexes are ordered in the same order.

1. `y` *(number)* - Point to search on the y axis, ensure the indexes are ordered in the same order.

1. [`options`] *(Object)*

1. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
users.geoNear(50, 50, {query:{a:1}, num:1}).then((results) => {})
```

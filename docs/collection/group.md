# `collection.group`

[Mongo documentation <i class="fa fa-external-link" style="position: relative; top: 2px;" />](http://mongodb.github.io/node-mongodb-native/2.1/api/Collection.html#group)

Run a group command across a collection.

#### Arguments

1. `keys` *(object | array | function)* - An object, array or function expressing the keys to group by.

2. `condition` *(Object)* - An optional condition that must be true for a row to be considered.

3. `initial` *(Object)* - Initial value of the aggregation counter object.

4. `reduce` *(Function)* - The reduce function aggregates (reduces) the objects iterated.

5. [`finalize`] *(Function)* - An optional function to be run on each item in the result set just before the item is returned.

6. [`command`] *(Boolean)* - Specify if you wish to run using the internal group command or using eval, default is true.

7. [`options`] *(Object)*

8. [`callback`] *(function)*

#### Returns

A promise.

#### Example

```js
users.group(
  { a: true },
  {},
  { count: 0 },
  function (obj, prev) {
    prev.count++
  },
  true
)
```

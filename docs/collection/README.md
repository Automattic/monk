# Collection

Object representing a mongo collection. Create it using [`manager.get`](../manager/get.md).

A Collection instance has the following methods:
  * [aggregate](aggregate.md)
  * [bulkWrite](bulkWrite.md)
  * [count](count.md)
  * [distinct](distinct.md)
  * [drop](drop.md)
  * [dropIndex](dropIndex.md)
  * [dropIndexes](dropIndexes.md)
  * [ensureIndex](ensureIndex.md)
  * [find](find.md)
  * [findOne](findOne.md)
  * [findOneAndDelete](findOneAndDelete.md)
  * [findOneAndUpdate](findOneAndUpdate.md)
  * [geoHaystackSearch](geoHaystackSearch.md)
  * [geoNear](geoNear.md)
  * [group](group.md)
  * [indexes](indexes.md)
  * [insert](insert.md)
  * [mapReduce](mapReduce.md)
  * [remove](remove.md)
  * [stats](stats.md)
  * [update](update.md)

#### Example

```js
const users = db.get('users', options)
```

#### Options

You can set options to pass to every queries of the collection.
```js
users.options = {
  castIds: true
}
```

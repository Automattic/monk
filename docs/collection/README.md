# Collection

Object representing a mongo collection. Create it using [`manager.get`](/docs/manager/get.md).

A Collection instance has the following methods:
  * [aggregate](/docs/collection/aggregate.md)
  * [count](/docs/collection/count.md)
  * [distinct](/docs/collection/distinct.md)
  * [drop](/docs/collection/drop.md)
  * [dropIndex](/docs/collection/dropIndex.md)
  * [dropIndexes](/docs/collection/dropIndexes.md)
  * [ensureIndex](/docs/collection/ensureIndex.md)
  * [find](/docs/collection/find.md)
  * [findOne](/docs/collection/findOne.md)
  * [finOneAndDelete](/docs/collection/finOneAndDelete.md)
  * [finOneAndUpdate](/docs/collection/finOneAndUpdate.md)
  * [indexes](/docs/collection/indexes.md)
  * [insert](/docs/collection/insert.md)
  * [remove](/docs/collection/remove.md)
  * [update](/docs/collection/update.md)

#### Example

```js
const users = db.get('users', options)
```

#### Options

You can set options to pass to every queries of the collection.
```js
users.options = {
  safe: true
}
```

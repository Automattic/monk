# `manager.create`

Create a collection.

#### Arguments

1. `name` *(string)*: name of the mongo collection

2. [`creationOptions`] *(object)*: options to create the collection

3. [`options`] *(object)*: collection level options

#### Returns

A [Collection](/docs/collection/README.md) instance.

#### Example

```js
const users = db.create('users', { capped: true, size: n })
```

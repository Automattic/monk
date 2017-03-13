# `monk.id`

Casts a string to (or create) an [ObjectId](https://docs.mongodb.com/manual/reference/method/ObjectId/).

In order to use custom id, castIds needs to be explicitly set to false as an option in collection operations.

#### Arguments

1. [`string`] *(string)*: optional hex id to cast to ObjectId. If not provided, a random ObjectId will be created.

#### Returns

An [ObjectId](https://docs.mongodb.com/manual/reference/method/ObjectId/).

#### Example

```js
const monk = require('monk')
const id = monk.id('4ee0fd75d6bd52107c000118')
const newId = monk.id()
```

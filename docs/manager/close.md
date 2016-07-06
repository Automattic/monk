# `manager.close`

Closes the connection.

#### Arguments

1. [`force`] *(Boolean)*: Force close, emitting no events

2. [`callback`] *(Function)*: You may optionally specify a callback which will be called once the connection to the mongo database is closed.

#### Returns

A Promise

#### Example

```js
db.close()
```

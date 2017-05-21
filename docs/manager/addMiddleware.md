# `manager.addMiddleware`

Add a middleware to the middlewares chain.

#### Arguments

1. `middleware` *(function)*: the middleware to add the the chain

#### Example

```js
db.addMiddleware(require('monk-plugin-dereference'))
```

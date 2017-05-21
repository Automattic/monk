# Writing middleware

If you haven't already, check out the [middleware article](./middlewares.md) to make sense of the middleware's API.

## API

```js
const middleware = ({collection, monkInstance}) => next => (args, method) => {
  // do something before the call

  /*
   * args: {
   *   options?: {}
   *   query?: any
   *   fields?: any
   *   field?: any
   *   update?: any
   *   some other fields for aggregate and group: see the documentation for those methods
   * }
   */

  // Always, always return `next`
  return next(args, method).then((res) => {
    // do something after the call
  })
}
```

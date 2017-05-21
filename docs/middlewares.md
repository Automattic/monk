# Middleware

*If you are familiar with [Redux](http://redux.js.org/) and Redux middlewares, you are familiar with Monk middlewares. They uses a very similar signature and architecture.*

If you've used server-side libraries like [Express](http://expressjs.com/) and [Koa](http://koajs.com/), you were also probably already familiar with the concept of *middleware*. In these frameworks, middleware is some code you can put between the framework receiving a request, and the framework generating a response. For example, Express or Koa middleware may add CORS headers, logging, compression, and more. The best feature of middleware is that it's composable in a chain. You can use multiple independent third-party middleware in a single project.

Monk middleware solves different problems than Express or Koa middleware, but in a conceptually similar way. **It provides a third-party extension point between calling a method, and the moment it reaches the mongo driver.** Most of the Monk features are implemented as Monk middleware: logging, handling callbacks or promises, casting the `_id`s, waiting for the database connection to open, and more.

## Understanding Middleware

While middleware can be used for a variety of things, including deferencing, it's really important that you understand where it comes from. We'll guide you through the thought process leading to middleware, by using logging and crash reporting as examples.

### Problem: Logging

Wouldn't it be nice if we logged every query that happens in the app, together with the result after it? When something goes wrong, we can look back at our log, and figure out which query broke.

How do we approach this with Monk?

### Attempt #1: Logging Manually

The most naïve solution is just to log the query and the result yourself every time you call a method ([`db.collection.insert(item)`](./collection/insert.md) for example). It's not really a solution, but just a first step towards understanding the problem.

Say, you call this when creating a todo:

```js
db.get('todos').insert({text: 'Use Monk'}))
```

To log the query and result, you can change it to something like this:

```js
let todo = {text: 'Use Monk'}

console.log('inserting', todo)
db.get('todos').insert(todo).then((res) => {
  console.log('inserting result', res)
  return res
})
```

This produces the desired effect, but you wouldn't want to do it every time.

### Attempt #2: Wrapping Method

You can extract logging into a function:

```js
function queryAndLog(collection, method, ...args) {
  console.log(method, ...args)
  collection[method](...args).then((res) => {
    console.log(method + ' result', res)
    return res
  })
}
```

You can then use it everywhere instead of `db.get(collection).method()`:

```js
queryAndLog(db.get('todos'), 'insert', {text: 'Use Monk'})
```

We could end this here, but it's not very convenient to import a special function every time.

### Attempt #3: Monkeypatching Method

What if we just replace the `insert` function on the store instance? We're writing JavaScript, so we can just monkeypatch the `insert` implementation:

```js
let next = db.get('todos').insert
db.get('todos').insert = function insertAndLog(...args) {
  console.log('insert', ...args)
  return next(...args).then((res) => {
    console.log('insert result', res)
    return res
  })
}
```

This is already closer to what we want!  No matter where we insert, it is guaranteed to be logged. Monkeypatching never feels right, but we can live with this for now. We would need to do that for each method of every collections tho. But let's say we only need to for a couple of methods, we could still live with this.

### Problem: Crash Reporting

What if we want to apply **more than one** such transformation to `insert`?

A different useful transformation that comes to my mind is reporting JavaScript errors in production.

Wouldn't it be useful if, any time an error is thrown as a result of a mongo query, we would send it to a crash reporting service like [Sentry](https://getsentry.com/welcome/) with the query and the current state? This way it's much easier to reproduce the error in development.

However, it is important that we keep logging and crash reporting separate. Ideally we want them to be different modules, potentially in different packages. Otherwise we can't have an ecosystem of such utilities. (Hint: we're slowly getting to what middleware is!)

If logging and crash reporting are separate utilities, they might look like this:

```js
function patchMethodToAddLogging(db, collection, method) {
  let next = db.get(collection)[method]
  db.get(collection)[method] = function methodAndLog(...args) {
    console.log(method, ...args)
    return next(...args).then((res) => {
      console.log(method + ' result', res)
      return res
    })
  }
}

function patchMethodToAddCrashReporting(db, collection, method) {
  let next = db.get(collection)[method]
  db.get(collection)[method] = function methodAndReportErrors(...args) {
    console.log(method, ...args)
    return next(...args).catch((err) => {
      console.error('Caught an exception!', err)
      Raven.captureException(err, {
        extra: {
          method,
          args
        }
      })
      throw err
    })
  }
}
```

If these functions are published as separate modules, we can later use them to patch our collection:

```js
patchMethodToAddLogging(db, 'todos', 'insert')
patchMethodToAddCrashReporting(db, 'todos', 'insert')
```

Still, this isn't nice.

### Attempt #4: Hiding Monkeypatching

Monkeypatching is a hack. “Replace any method you like”, what kind of API is that? Let's figure out the essence of it instead. Previously, our functions replaced `db.collection.insert`. What if they *returned* the new `insert` function instead?

```js
function logger(db, collection, method) {
  let next = db.get(collection)[method]

  // Previously:
  // db.get(collection)[method] = function methodAndLog(...args) {

  return function methodAndLog(...args) {
    console.log(method, ...args)
    return next(...args).then((res) => {
      console.log(method + ' result', res)
      return res
    })
  }
}
```

We could provide a helper inside Redux that would apply the actual monkeypatching as an implementation detail:

```js
function applyMiddlewareByMonkeypatching(db, collection, method, middlewares) {
  middlewares = middlewares.slice()
  middlewares.reverse()

  // Transform dispatch function with each middleware.
  middlewares.forEach(middleware =>
    db.get(collection)[method] = middleware(db, collection, method)
  )
}
```

We could use it to apply multiple middleware like this:

```js
applyMiddlewareByMonkeypatching(db, 'todos', 'insert', [logger, crashReporter])
```

However, it is still monkeypatching.
The fact that we hide it inside the library doesn't alter this fact.

### Attempt #5: Removing Monkeypatching

Why do we even overwrite `insert`? Of course, to be able to call it later, but there's also another reason: so that every middleware can access (and call) the previously wrapped `collection.method`:

```js
function logger(db, collection, method) {
  // Must point to the function returned by the previous middleware:
  let next = db.get(collection)[method]

  return function methodAndLog(...args) {
    console.log(method, ...args)
    return next(...args).then((res) => {
      console.log(method + ' result', res)
      return res
    })
  }
}
```

It is essential to chaining middleware!

If `applyMiddlewareByMonkeypatching` doesn't assign `collection.method` immediately after processing the first middleware, `collection.method` will keep pointing to the original `method` function. Then the second middleware will also be bound to the original `method` function.

But there's also a different way to enable chaining. The middleware could accept the `next()` insert function as a parameter instead of reading it from the `collection` instance.

```js
function logger(context) {
  return function wrapMethodToAddLogging(next) {
    return function methodAndLog(args, method) {
      console.log(method, ...args)
      return next(args, method).then((res) => {
        console.log(method + ' result', res)
        return res
      })
    }
  }
}
```

It's a [“we need to go deeper”](http://knowyourmeme.com/memes/we-need-to-go-deeper) kind of moment, so it might take a while for this to make sense. The function cascade feels intimidating. ES6 arrow functions make this [currying](https://en.wikipedia.org/wiki/Currying) easier on eyes:

```js
const logger = context => next => (...args) => {
  console.log(method, ...args)
  return next(...args).then((res) => {
    console.log(method + ' result', res)
    return res
  })
}

const crashReporter = context => next => (...args) => {
  return next(...args).catch((err) => {
    console.error('Caught an exception!', err)
    Raven.captureException(err, {
        extra: {
          method,
          args
        }
      })
    throw err
  })
}
```

**This is exactly what Monk middleware looks like.**

Now middleware takes the `next()` dispatch function, and returns a dispatch function, which in turn serves as `next()` to the middleware to the left, and so on. It's still useful to have access to some context like the collection and the Monk instance, so `{collection, monkInstance}` stays available as the top-level argument.

### Attempt #6: Naïvely Applying the Middleware

Instead of `applyMiddlewareByMonkeypatching()`, we could write `applyMiddleware()` that first obtains the final, fully wrapped `method()` function, and returns a copy of the method:

```js
// Warning: Naïve implementation!
// That's *not* Monk API.
function applyMiddleware(db, collection, method, middlewares) {
  middlewares = middlewares.slice()
  middlewares.reverse()
  let next = collection[method]
  middlewares.forEach(middleware =>
    next = middleware({monkInstance: db, collection})(next)
  )
  return next
}
```

The implementation of `applyMiddleware()` that ships with Monk is similar, but **different in a very important aspect**:

It is called when first getting a collection so that the collection can automatically call the middlewares chain on every method.

As a result, instead of the method being in the first argument of the middleware, it is in the last.

### The Final Approach

Given this middleware we just wrote:

```js
const logger = context => next => (args, method) => {
  console.log(method, args)
  return next(args, method).then((res) => {
    console.log(method + ' result', res)
    return res
  })
}

const crashReporter = context => next => (args, method) => {
  return next(args, method).catch((err) => {
    console.error('Caught an exception!', err)
    Raven.captureException(err, {
        extra: {
          method,
          args
        }
      })
    throw err
  })
}
```

Here's how to apply it to a Monk instance:

```js
db.addMiddleware(logger)
db.addMiddleware(crashReporter)
```

That's it! Now any method called by the monk instance will flow through `logger` and `crashReporter`:

```js
// Will flow through both logger and crashReporter middleware!
db.get('todos').insert({text: 'Use Monk'}))
```

<h1 align="center">Monk</h1>

<div align="center">
  <img src="https://avatars2.githubusercontent.com/u/28830676?v=3&s=200" />
</div>
<br />
<div align="center">
  <strong>A tiny layer that provides simple yet substantial usability
improvements for MongoDB usage within Node.JS.</strong>
</div>
<br />

[![build status](https://secure.travis-ci.org/Automattic/monk.svg?branch=master)](https://secure.travis-ci.org/Automattic/monk)
[![codecov](https://codecov.io/gh/Automattic/monk/branch/master/graph/badge.svg)](https://codecov.io/gh/Automattic/monk)
[![Join the chat at https://gitter.im/Automattic/monk](https://badges.gitter.im/Automattic/monk.svg)](https://gitter.im/Automattic/monk?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

*note*: monk 2.x drop the support for node < 0.12. If you are still using an earlier version, stick to monk 1.x

```js
const db = require('monk')('localhost/mydb')
// or
// const db = require('monk')('user:pass@localhost:port/mydb')

const users = db.get('users')

users.index('name last')
users.insert({ name: 'Tobi', bigdata: {} })
users.find({ name: 'Loki' }, '-bigdata').then(function () {
  // exclude bigdata field
})
users.find({}, {sort: {name: 1}}).then(function () {
  // sorted by name field
})
users.remove({ name: 'Loki' })

db.close()
```

## Features

- Well-designed API signatures
- Easy connections / configuration
- Command buffering. You can start querying right away
- Promises built-in for all queries. Easy interoperability with modules
- Auto-casting of `_id` in queries
- Allows to set global options or collection-level options for queries. (eg:
  `castIds` is `true` by default for all queries)

## Middlewares

Most of the Monk's features are implemented as [middleware](https://automattic.github.io/monk/docs/middlewares.html).

There are a bunch of third-parties middlewares that add even more functionalities to Monk:
- [monk-middleware-wrap-non-dollar-update](https://github.com/monk-middlewares/monk-middleware-wrap-non-dollar-update)
- [monk-middleware-debug](https://github.com/monk-middlewares/monk-middleware-debug)
- [monk-middleware-dereference](https://github.com/monk-middlewares/monk-middleware-dereference)

*Created an nice middleware? Send a PR to add to the list!*

## How to use

[Documentation](https://Automattic.github.io/monk)

## License

MIT

# monk

[![build status](https://secure.travis-ci.org/Automattic/monk.svg?branch=master)](https://secure.travis-ci.org/Automattic/monk)
[![codecov](https://codecov.io/gh/Automattic/monk/branch/master/graph/badge.svg)](https://codecov.io/gh/Automattic/monk)
[![Join the chat at https://gitter.im/Automattic/monk](https://badges.gitter.im/Automattic/monk.svg)](https://gitter.im/Automattic/monk?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Monk is a tiny layer that provides simple yet substantial usability
improvements for MongoDB usage within Node.JS.

*note*: monk 2.x drop the support for node < 0.12. If you are still using an earlier version, stick to monk 1.x

```js
const db = require('monk')('localhost/mydb')
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

- Command buffering. You can start querying right away.
- Promises built-in for all queries. Easy interoperability with modules.
- Easy connections / configuration
- Well-designed signatures
- Improvements to the MongoDB APIs (eg: `findAndModify` supports the
  `update` signature style)
- Auto-casting of `_id` in queries
- Allows to set global options or collection-level options for queries. (eg:
  `safe` is `true` by default for all queries)

## How to use

[Documentation](https://Automattic.github.io/monk)

## License

(The MIT License)

Copyright (c) 2012 Guillermo Rauch &lt;guillermo@learnboost.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

import test from 'ava'

const monk = require('../lib/monk')

test('Manager', (t) => {
  t.is(typeof monk, 'function')
  t.is(monk.name, 'Manager')
})

test('Collection', (t) => {
  t.is(typeof monk.Collection, 'function')
  t.is(monk.Collection.name, 'Collection')
})

test('Should throw if no uri provided', (t) => {
  try {
    monk()
  } catch (e) {
    t.is(e.message, 'No connection URI provided.')
  }
})

test('Should handle srv connection string', (t) => {
  const m = monk('mongodb+srv://user:pw@host')
  t.true(m._connectionURI === 'mongodb+srv://user:pw@host')
})

test.cb('to a regular server', (t) => {
  t.plan(2)
  monk('127.0.0.1/monk-test', (err, db) => {
    t.falsy(err)
    t.true(db instanceof monk)
    t.end()
  })
})

test('connect with an existing mongo client instance', (t) => {
  t.plan(3)
  return monk('127.0.0.1/monk-test', (err, db) => {
    t.falsy(err)
    return monk(db._client, (err, db) => {
      t.falsy(err)
      t.true(db instanceof monk)
    })
  })
})

test('connect with promise', (t) => {
  return monk('127.0.0.1/monk-test').then((db) => {
    t.true(db instanceof monk)
  })
})

test('connect with an existing mongo client instance with a promise', (t) => {
  return monk('127.0.0.1/monk-test').then((db) => {
    return monk(db._client).then((db2) => {
      t.true(db2 instanceof monk)
    })
  })
})

test.cb('should fail', (t) => {
  t.plan(2)
  monk('non-existent-db/monk-test', (err, db) => {
    t.truthy(err)
    t.true(db instanceof monk)
    t.end()
  })
})

test('should fail with promise', (t) => {
  return monk('non-existent-db/monk-test').catch((err) => {
    t.truthy(err)
  })
})

test.cb('to a replica set (array)', (t) => {
  t.plan(1)
  monk(['127.0.0.1/monk-test', 'localhost/monk-test'], () => {
    t.pass()
    t.end()
  })
})

test.cb('to a replica set (string)', (t) => {
  t.plan(1)
  monk('127.0.0.1,localhost/monk-test', () => {
    t.pass()
    t.end()
  })
})

test.cb('followed by disconnection', (t) => {
  t.plan(1)
  const db = monk('127.0.0.1/monk-test', () => {
    db.close(() => {
      t.pass()
      t.end()
    })
  })
})

test('executeWhenOpened > should reopen the connection if closed', (t) => {
  const db = monk('127.0.0.1/monk')
  return db
    .then(() => t.is(db._state, 'open'))
    .then(() => db.close(true))
    .then(() => t.is(db._state, 'closed'))
    .then(() => db.executeWhenOpened())
    .then(() => t.is(db._state, 'open'))
    .then(() => db.close())
})

test('close > closing a closed connection should work', (t) => {
  const db = monk('127.0.0.1/monk')
  return db
    .then(() => t.is(db._state, 'open'))
    .then(() => db.close())
    .then(() => t.is(db._state, 'closed'))
    .then(() => db.close())
})

test.cb('close > closing should emit an event', (t) => {
  const db = monk('127.0.0.1/monk')
  db.on('close', () => t.end())
  db.close()
})

test.cb('close > closing a closed connection should work with callback', (t) => {
  const db = monk('127.0.0.1/monk')
  db.then(() => t.is(db._state, 'open'))
    .then(() => db.close(() => {
      t.is(db._state, 'closed')
      db.close(() => t.end())
    }))
})

test('close > closing an opening connection should close it once opened', (t) => {
  const db = monk('127.0.0.1/monk')
  return db.close().then(() => t.pass())
})

const Collection = monk.Collection
const db = monk('127.0.0.1/monk-test')

test('Manager#create', (t) => {
  t.true(db.create('users') instanceof Collection)
})

test('Manager#get', (t) => {
  t.true(db.get('users') instanceof Collection)
})

test('Manager#listCollections', (t) => {
  return db.listCollections().then(collections => t.true(collections instanceof Array))
})

test('Manager#col', (t) => {
  t.true(db.col('users') instanceof Collection)
})

test('Manager#id', (t) => {
  const oid = db.id()
  t.is(typeof oid.toHexString(), 'string')
})

test('Manager#oid', (t) => {
  const oid = db.oid()
  t.is(typeof oid.toHexString(), 'string')
})

test('oid from hex string', (t) => {
  const oid = db.oid('4ee0fd75d6bd52107c000118')
  t.is(oid.toString(), '4ee0fd75d6bd52107c000118')
})

test('oid from oid', (t) => {
  const oid = db.oid()
  t.is(db.oid(oid), oid)
})

test('option useNewUrlParser should be true if not specified', (t) => {
  return monk('127.0.0.1/monk-test').then((db) => {
    t.is(db._connectionOptions.useNewUrlParser, true)
  })
})

test('option useNewUrlParser should be true if specified', (t) => {
  return monk('127.0.0.1/monk-test', { useNewUrlParser: true }).then((db) => {
    t.is(db._connectionOptions.useNewUrlParser, true)
  })
})

test('option useNewUrlParser should have the specified value', (t) => {
  return monk('127.0.0.1/monk-test', { useNewUrlParser: false }).then((db) => {
    t.is(db._connectionOptions.useNewUrlParser, false)
  })
})

test('option useUnifiedTopology should be true if not specified', (t) => {
  return monk('127.0.0.1/monk-test').then(db => {
    t.is(db._connectionOptions.useUnifiedTopology, true)
  })
})

test('option useUnifiedTopology should be true if specified', (t) => {
  return monk('127.0.0.1/monk-test', { useUnifiedTopology: true }).then(db => {
    t.is(db._connectionOptions.useUnifiedTopology, true)
  })
})

test('option useUnifiedTopology should have the specified value', (t) => {
  return monk('127.0.0.1/monk-test', { useUnifiedTopology: false }).then(db => {
    t.is(db._connectionOptions.useUnifiedTopology, false)
  })
})

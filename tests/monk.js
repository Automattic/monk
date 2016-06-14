import test from 'ava'

const Monk = require('../lib/monk')

test('Manager', (t) => {
  t.is(typeof Monk, 'function')
  t.is(Monk.name, 'Manager')
})

test('Collection', (t) => {
  t.is(typeof Monk.Collection, 'function')
  t.is(Monk.Collection.name, 'Collection')
})

test('Should throw if no uri provided', (t) => {
  try {
    new Monk() // eslint-disable-line no-new
  } catch (e) {
    t.is(e.message, 'No connection URI provided.')
  }
})

test.cb('to a regular server', (t) => {
  t.plan(1)
  new Monk('127.0.0.1/monk-test', () => { // eslint-disable-line no-new
    t.pass()
    t.end()
  })
})

test.cb('to a replica set (array)', (t) => {
  t.plan(1)
  new Monk(['127.0.0.1/monk-test', 'localhost/monk-test'], () => { // eslint-disable-line no-new
    t.pass()
    t.end()
  })
})

test.cb('to a replica set (string)', (t) => {
  t.plan(1)
  new Monk('127.0.0.1,localhost/monk-test', () => { // eslint-disable-line no-new
    t.pass()
    t.end()
  })
})

test.cb('followed by disconnection', (t) => {
  t.plan(1)
  const db = new Monk('127.0.0.1/monk-test', () => {
    db.close(() => {
      t.pass()
      t.end()
    })
  })
})

const Collection = Monk.Collection
const db = new Monk('127.0.0.1/monk-test')

test('Manager#get', (t) => {
  t.true(db.get('users')instanceof Collection)
})

test('Manager#col', (t) => {
  t.true(db.col('users')instanceof Collection)
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

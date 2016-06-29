import test from 'ava'

const Monk = require('../lib/monk')

const db = new Monk('127.0.0.1/monk-test-collection')
const users = db.get('users')

test('string -> oid', (t) => {
  const oid = users.id('4ee0fd75d6bd52107c000118')
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('oid -> oid', (t) => {
  const oid = users.id(users.id('4ee0fd75d6bd52107c000118'))
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('new oid', (t) => {
  const oid = users.id()
  t.is(typeof oid.toHexString(), 'string')
})

test('#oid', (t) => {
  const oid = users.oid()
  t.is(typeof oid.toHexString(), 'string')
})

test('should cast oids inside $and', (t) => {
  const cast = users.cast({
    $and: [{_id: '4ee0fd75d6bd52107c000118'}]
  })

  const oid = users.id(cast.$and[0]._id)
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast oids inside $nor', (t) => {
  const cast = users.cast({
    $nor: [{_id: '4ee0fd75d6bd52107c000118'}]
  })

  const oid = users.id(cast.$nor[0]._id)
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast oids inside $not queries', (t) => {
  const cast = users.cast({$not: {_id: '4ee0fd75d6bd52107c000118'}})

  const oid = users.id(cast.$not._id)
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast oids inside $ne queries', (t) => {
  const cast = users.cast({_id: {$ne: '4ee0fd75d6bd52107c000118'}})

  const oid = users.id(cast._id.$ne)
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast oids inside $in queries', (t) => {
  const cast = users.cast({_id: {$in: ['4ee0fd75d6bd52107c000118']}})

  const oid = users.id(cast._id.$in[0])
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast oids inside $nin queries', (t) => {
  const cast = users.cast({_id: {$nin: ['4ee0fd75d6bd52107c000118']}})

  const oid = users.id(cast._id.$nin[0])
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast oids inside $set queries', (t) => {
  const cast = users.cast({$set: {_id: '4ee0fd75d6bd52107c000118'}})

  const oid = users.id(cast.$set._id)
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast oids inside $or', (t) => {
  const cast = users.cast({
    $or: [{_id: '4ee0fd75d6bd52107c000118'}]
  })

  const oid = users.id(cast.$or[0]._id)
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

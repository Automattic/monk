import test from 'ava'

const monk = require('../lib/monk')

test('string -> id', (t) => {
  const oid = monk.id('4ee0fd75d6bd52107c000118')
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('id -> id', (t) => {
  const oid = monk.id(monk.id('4ee0fd75d6bd52107c000118'))
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('new id', (t) => {
  const oid = monk.id()
  t.is(typeof oid.toHexString(), 'string')
})

test('should cast ids inside $and', (t) => {
  const cast = monk.util.cast({
    $and: [{_id: '4ee0fd75d6bd52107c000118'}]
  })

  const oid = monk.id(cast.$and[0]._id)
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast ids inside $nor', (t) => {
  const cast = monk.util.cast({
    $nor: [{_id: '4ee0fd75d6bd52107c000118'}]
  })

  const oid = monk.id(cast.$nor[0]._id)
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast ids inside $not queries', (t) => {
  const cast = monk.util.cast({$not: {_id: '4ee0fd75d6bd52107c000118'}})

  const oid = monk.id(cast.$not._id)
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast ids inside $ne queries', (t) => {
  const cast = monk.util.cast({_id: {$ne: '4ee0fd75d6bd52107c000118'}})

  const oid = monk.id(cast._id.$ne)
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast ids inside $in queries', (t) => {
  const cast = monk.util.cast({_id: {$in: ['4ee0fd75d6bd52107c000118']}})

  const oid = monk.id(cast._id.$in[0])
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast ids inside $nin queries', (t) => {
  const cast = monk.util.cast({_id: {$nin: ['4ee0fd75d6bd52107c000118']}})

  const oid = monk.id(cast._id.$nin[0])
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast ids inside $set queries', (t) => {
  const cast = monk.util.cast({$set: {_id: '4ee0fd75d6bd52107c000118'}})

  const oid = monk.id(cast.$set._id)
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast ids inside $or', (t) => {
  const cast = monk.util.cast({
    $or: [{_id: '4ee0fd75d6bd52107c000118'}]
  })

  const oid = monk.id(cast.$or[0]._id)
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should cast nested ids', (t) => {
  const cast = monk.util.cast({
    $pull: { items: [{ _id: '4ee0fd75d6bd52107c000118' }] }
  })

  const oid = monk.id(cast.$pull.items[0]._id)
  t.is(oid.toHexString(), '4ee0fd75d6bd52107c000118')
})

test('should not fail when casting 0', (t) => {
  const cast = monk.util.cast(0)

  t.is(cast, 0)
})

test('should not fail when casting null', (t) => {
  const cast = monk.util.cast(null)

  t.is(cast, null)
})

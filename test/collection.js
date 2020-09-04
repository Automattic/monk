import test from 'ava'

const monk = require('../lib/monk')

const db = monk('127.0.0.1/monk')
db.addMiddleware(require('monk-middleware-debug'))
const usersName = 'users-' + Date.now()
const users = db.get(usersName)
const indexCol = db.get('index-' + Date.now())

test.after(() => {
  return users.drop()
})

test('createIndex > should accept a field string', (t) => {
  return indexCol.createIndex('name.first').then(indexCol.indexes).then((indexes) => {
    t.not(indexes['name.first_1'], undefined)
  })
})

test('createIndex > should accept an object argument', (t) => {
  return indexCol.createIndex({location: '2dsphere'}).then(indexCol.indexes).then((indexes) => {
    t.not(indexes.location_2dsphere, undefined)
  })
})

test('createIndex > should accept space-delimited compound indexes', (t) => {
  return indexCol.createIndex('name last').then(indexCol.indexes).then((indexes) => {
    t.not(indexes.name_1_last_1, undefined)
  })
})

test('createIndex > should accept array compound indexes', (t) => {
  return indexCol.createIndex(['nombre', 'apellido']).then(indexCol.indexes).then((indexes) => {
    t.not(indexes.nombre_1_apellido_1, undefined)
  })
})

test('createIndex > should accept object compound indexes', (t) => {
  return indexCol.createIndex({ up: 1, down: -1 }).then(indexCol.indexes).then((indexes) => {
    t.not(indexes['up_1_down_-1'], undefined)
  })
})

test('createIndex > should accept options', (t) => {
  return indexCol.createIndex({ woot: 1 }, { unique: true }).then(indexCol.indexes).then((indexes) => {
    t.not(indexes.woot_1, undefined)
  })
})

test.cb('createIndex > callback', (t) => {
  indexCol.createIndex('name.third', t.end)
})

test('index > should accept a field string', (t) => {
  return indexCol.index('name.first').then(indexCol.indexes).then((indexes) => {
    t.not(indexes['name.first_1'], undefined)
  })
})

test('dropIndex > should accept a field string', (t) => {
  return indexCol.index('name2.first').then(indexCol.indexes).then((indexes) => {
    t.not(indexes['name2.first_1'], undefined)
  }).then(() => indexCol.dropIndex('name2.first'))
    .then(indexCol.indexes).then((indexes) => {
      t.is(indexes['name2.first_1'], undefined)
    })
})

test('dropIndex > should accept space-delimited compound indexes', (t) => {
  return indexCol.index('name2 last').then(indexCol.indexes).then((indexes) => {
    t.not(indexes.name2_1_last_1, undefined)
  }).then(() => indexCol.dropIndex('name2 last'))
    .then(indexCol.indexes).then((indexes) => {
      t.is(indexes.name2_1_last_1, undefined)
    })
})

test('dropIndex > should accept array compound indexes', (t) => {
  return indexCol.index(['nombre2', 'apellido']).then(indexCol.indexes).then((indexes) => {
    t.not(indexes.nombre2_1_apellido_1, undefined)
  }).then(() => indexCol.dropIndex(['nombre2', 'apellido']))
    .then(indexCol.indexes).then((indexes) => {
      t.is(indexes.nombre2_1_apellido_1, undefined)
    })
})

test('dropIndex > should accept object compound indexes', (t) => {
  return indexCol.index({ up2: 1, down: -1 }).then(indexCol.indexes).then((indexes) => {
    t.not(indexes['up2_1_down_-1'], undefined)
  }).then(() => indexCol.dropIndex({ up2: 1, down: -1 }))
    .then(indexCol.indexes).then((indexes) => {
      t.is(indexes['up2_1_down_'], undefined)
    })
})

test.cb('dropIndex > callback', (t) => {
  indexCol.index('name3.first').then(indexCol.indexes).then((indexes) => {
    t.not(indexes['name3.first_1'], undefined)
  }).then(() => indexCol.dropIndex('name3.first', t.end))
})

test('dropIndexes > should drop all indexes', (t) => {
  const col = db.get('indexDrop-' + Date.now())
  return col.index({ up2: 1, down: -1 })
    .then(col.indexes)
    .then((indexes) => {
      t.not(indexes['up2_1_down_-1'], undefined)
    }).then(() => col.dropIndexes())
    .then(col.indexes)
    .then((indexes) => {
      t.is(indexes['up2_1_down_'], undefined)
    })
})

test.cb('dropIndexes > callback', (t) => {
  const col = db.get('indexDropCallback-' + Date.now())
  col.index({ up2: 1, down: -1 }).then(col.indexes).then((indexes) => {
    t.not(indexes['up2_1_down_-1'], undefined)
  }).then(() => col.dropIndexes(t.end))
})

test('insert > should force callback in next tick', (t) => {
  return users.insert({ woot: 'a' }).then(() => t.pass())
})

test('insert > should give you an object with the _id', (t) => {
  return users.insert({ woot: 'b' }).then((obj) => {
    t.is(typeof obj._id, 'object')
    t.not(obj._id.toHexString, undefined)
  })
})

test('insert > should return an array if an array was inserted', (t) => {
  return users.insert([{ woot: 'c' }, { woot: 'd' }]).then((docs) => {
    t.true(Array.isArray(docs))
    t.is(docs.length, 2)
  })
})

test('insert > should not fail when inserting an empty array', (t) => {
  return users.insert([]).then((docs) => {
    t.true(Array.isArray(docs))
    t.is(docs.length, 0)
  })
})

test.cb('insert > callback', (t) => {
  users.insert({ woot: 'a' }, t.end)
})

test('findOne > should return null if no document', (t) => {
  return users.findOne({nonExistingField: true})
    .then((doc) => {
      t.is(doc, null)
    })
})

test('findOne > findOne(undefined) should work', (t) => {
  return users.insert({ a: 'b', c: 'd', e: 'f' }).then((doc) => {
    return users.findOne()
  }).then(() => {
    t.pass()
  })
})

test('findOne > should only provide selected fields', (t) => {
  return users.insert({ a: 'b', c: 'd', e: 'f' }).then((doc) => {
    return users.findOne(doc._id, 'a e')
  }).then((doc) => {
    t.is(doc.a, 'b')
    t.is(doc.e, 'f')
    t.is(doc.c, undefined)
  })
})

test('find > should project only specified fields using projection options', t => {
  return users.insert([
    { a: 1, b: 2 },
    { a: 1, b: 1 }
  ]).then(() => {
    return users.find({ sort: true }, { projection: { a: 1 } })
  }).then((docs) => {
    t.is(docs[0].a, 1)
    t.is(docs[0].b, undefined)
    t.is(docs[1].a, 1)
    t.is(docs[1].b, undefined)
  })
})

test.cb('findOne > callback', (t) => {
  users.insert({ woot: 'e' }).then((doc) => {
    return users.findOne(doc._id, t.end)
  })
})

test('find > should find with nested query', (t) => {
  return users.insert([{ nested: { a: 1 } }, { nested: { a: 2 } }]).then(() => {
    return users.find({ 'nested.a': 1 })
  }).then((docs) => {
    t.is(docs.length, 1)
    t.is(docs[0].nested.a, 1)
  })
})

test('find > should find with nested array query', (t) => {
  return users.insert([{ nestedArray: [{ a: 1 }] }, { nestedArray: [{ a: 2 }] }]).then(() => {
    return users.find({ 'nestedArray.a': 1 })
  }).then((docs) => {
    t.is(docs.length, 1)
    t.is(docs[0].nestedArray[0].a, 1)
  })
})

test('find > should sort', (t) => {
  return users.insert([{ sort: true, a: 1, b: 2 }, { sort: true, a: 1, b: 1 }]).then(() => {
    return users.find({ sort: true }, { sort: '-a b' })
  }).then((docs) => {
    t.is(docs[0].b, 1)
    t.is(docs[1].b, 2)
  })
})

test('find > should return the raw cursor', (t) => {
  const query = { stream: 3 }
  return users.insert([{ stream: 3 }, { stream: 3 }, { stream: 3 }, { stream: 3 }]).then(() => {
    return users.find(query, {rawCursor: true})
      .then((cursor) => {
        t.truthy(cursor.close)
        t.truthy(cursor.pause)
        t.truthy(cursor.resume)
        cursor.close()
      })
  })
})

test('find > should work with streaming', (t) => {
  const query = { stream: 1 }
  let found = 0
  return users.insert([{ stream: 1 }, { stream: 1 }, { stream: 1 }, { stream: 1 }]).then(() => {
    return users.find(query)
      .each((doc) => {
        t.is(doc.stream, 1)
        found++
      })
      .then(() => {
        t.is(found, 4)
      })
  })
})

test('find > should work with streaming option', (t) => {
  const query = { stream: 2 }
  let found = 0
  return users.insert([{ stream: 2 }, { stream: 2 }, { stream: 2 }, { stream: 2 }]).then(() => {
    return users.find(query, { stream: true })
      .each((doc) => {
        t.is(doc.stream, 2)
        found++
      })
      .then(() => {
        t.is(found, 4)
      })
  })
})

test('find > should work with streaming option without each', (t) => {
  const query = { stream: 5 }
  let found = 0
  return users.insert([{ stream: 5 }, { stream: 5 }, { stream: 5 }, { stream: 5 }]).then(() => {
    return users.find(query, {
      stream (doc) {
        t.is(doc.stream, 5)
        found++
      }
    })
      .then(() => {
        t.is(found, 4)
      })
  })
})

test('find > should allow stream cursor destroy', (t) => {
  const query = { cursor: { $exists: true } }
  let found = 0
  return users.insert([{ cursor: true }, { cursor: true }, { cursor: true }, { cursor: true }]).then(() => {
    return users.find(query)
      .each((doc, {close}) => {
        t.not(doc.cursor, null)
        found++
        if (found === 2) close()
      })
      .then(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            t.is(found, 2)
            resolve()
          }, 100)
        })
      })
  })
})

test('find > should allow stream cursor destroy even when paused', (t) => {
  const query = { cursor: { $exists: true } }
  let found = 0
  return users.insert([{ cursor: true }, { cursor: true }, { cursor: true }, { cursor: true }]).then(() => {
    return users.find(query)
      .each((doc, {close, pause, resume}) => {
        pause()
        t.not(doc.cursor, null)
        found++
        if (found === 2) return close()
        resume()
      })
      .then(() => {
        return new Promise((resolve) => {
          setTimeout(() => {
            t.is(found, 2)
            resolve()
          }, 100)
        })
      })
  })
})

test('find > stream pause and continue', (t) => {
  const query = { stream: 4 }
  return users.insert([{ stream: 4 }, { stream: 4 }, { stream: 4 }, { stream: 4 }]).then(() => {
    const start = Date.now()
    let index = 0
    return users.find(query)
      .each((doc, {pause, resume}) => {
        pause()
        const duration = Date.now() - start
        t.true(duration > index * 1000)
        setTimeout(() => {
          index += 1
          resume()
        }, 1000)
      })
      .then(() => {
        t.is(index, 4)
        const duration = Date.now() - start
        t.true(duration > 4000)
      })
  })
})

test.cb('find > stream callback', (t) => {
  const query = { stream: 3 }
  users.insert([{ stream: 3 }, { stream: 3 }, { stream: 3 }, { stream: 3 }]).then(() => {
    return users.find(query, t.end)
      .each((doc) => {
        t.not(doc.a, null)
      })
  })
})

test.cb('find > callback', (t) => {
  users.insert({ woot: 'e' }).then((doc) => {
    return users.find(doc._id, t.end)
  })
})

test('group > should work', (t) => {
  return users.insert([{ group: true }, { group: true }]).then(() => {
    return users.group(
      { group: true },
      {},
      { count: 0 },
      function (obj, prev) {
        return prev.count++
      }
    )
  }).then(([group1, group2]) => {
    t.is(group1.group, null)
    t.true(group2.group)
    t.is(group2.count, 2)
  })
})

test.cb('group > callback', (t) => {
  users.group(
    { group: true },
    {},
    { count: 0 },
    function (obj, prev) {
      prev.count++
    },
    function (x) { return x },
    true,
    t.end
  )
})

test('count > should count', (t) => {
  return users.count({ a: 'counting' }).then((count) => {
    t.is(count, 0)
    return users.insert({ a: 'counting' })
  }).then(() => {
    return users.count({ a: 'counting' })
  }).then((count) => {
    t.is(count, 1)
  })
})

test('count > should not ignore options', (t) => {
  return users.count({ b: 'counting' }).then((count) => {
    t.is(count, 0)
    return users.insert([{ b: 'counting' }, { b: 'counting' }, { b: 'counting' }, { b: 'counting' }])
  }).then(() => {
    return users.count({ b: 'counting' }, {limit: 2})
  }).then((count) => {
    t.is(count, 2)
  })
})

test('count > should count with no arguments', (t) => {
  return users.count({ c: 'counting' }).then((count) => {
    t.is(count, 0)
    return users.insert({ c: 'counting' })
  }).then(() => {
    return users.count()
  }).then((count) => {
    t.is(count, 77)
  })
})

test('count > should estimate count', (t) => {
  return users.count({}, { estimate: true }).then((count) => {
    t.is(count, 51)
  })
})

test('count > should estimate count with options', (t) => {
  return users.count({}, { estimate: true, maxTimeMS: 10000 }).then((count) => {
    t.is(count, 51)
  })
})

test.cb('count > callback', (t) => {
  users.count({ a: 'counting' }, t.end)
})

test('distinct', (t) => {
  return users.insert([{ distinct: 'a' }, { distinct: 'a' }, { distinct: 'b' }]).then(() => {
    return users.distinct('distinct')
  }).then((docs) => {
    t.deepEqual(docs, ['a', 'b'])
  })
})

test('distinct with options', (t) => {
  return users.insert([{ distinct2: 'a' }, { distinct2: 'a' }, { distinct2: 'b' }]).then(() => {
    return users.distinct('distinct2', {})
  }).then((docs) => {
    t.deepEqual(docs, ['a', 'b'])
  })
})

test.cb('distinct > with options callback', (t) => {
  users.distinct('distinct', {}, t.end)
})

test.cb('distinct > callback', (t) => {
  users.distinct('distinct', t.end)
})

test('update > should update', (t) => {
  return users.insert({ d: 'e' }).then((doc) => {
    return users.update({ _id: doc._id }, { $set: { d: 'f' } }).then(() => {
      return users.findOne(doc._id)
    })
  }).then((doc) => {
    t.is(doc.d, 'f')
  })
})

test('update > should update with 0', (t) => {
  return users.insert({ d: 'e' }).then((doc) => {
    return users.update({ _id: doc._id }, { $set: { d: 0 } }).then(() => {
      return users.findOne(doc._id)
    })
  }).then((doc) => {
    t.is(doc.d, 0)
  })
})

test.cb('update > callback', (t) => {
  users.update({ d: 'e' }, { $set: { d: 'f' } }, t.end)
})

test('update > should update with an objectid', (t) => {
  return users.insert({ d: 'e' }).then((doc) => {
    return users.update(doc._id, { $set: { d: 'f' } }).then(() => {
      return users.findOne(doc._id)
    })
  }).then((doc) => {
    t.is(doc.d, 'f')
  })
})

test('update > should update with an objectid (string)', (t) => {
  return users.insert({ d: 'e' }).then((doc) => {
    return users.update(doc._id.toString(), { $set: { d: 'f' } }).then(() => {
      return users.findOne(doc._id)
    })
  }).then((doc) => {
    t.is(doc.d, 'f')
  })
})

test('remove > should remove a document', (t) => {
  return users.insert({ name: 'Tobi' }).then((doc) => {
    return users.remove({ name: 'Tobi' })
  }).then(() => {
    return users.find({ name: 'Tobi' })
  }).then((doc) => {
    t.deepEqual(doc, [])
  })
})

test.cb('remove > callback', (t) => {
  users.remove({ name: 'Mathieu' }, t.end)
})

test('findOneAndDelete > should remove a document and return it', (t) => {
  return users.insert({ name: 'Bob' }).then((doc) => {
    return users.findOneAndDelete({ name: 'Bob' })
  }).then((doc) => {
    t.is(doc.name, 'Bob')
    return users.find({ name: 'Bob' })
  }).then((doc) => {
    t.deepEqual(doc, [])
  })
})

test.cb('findOneAndDelete > callback', (t) => {
  users.insert({ name: 'Bob2' }).then((doc) => {
    users.findOneAndDelete({ name: 'Bob2' }, (err, doc) => {
      t.is(err, null)
      t.is(doc.name, 'Bob2')
      users.find({ name: 'Bob2' }).then((doc) => {
        t.deepEqual(doc, [])
        t.end()
      })
    })
  })
})

test('findOneAndDelete > should return null if found nothing', (t) => {
  return users.findOneAndDelete({ name: 'Bob3' })
    .then((doc) => {
      t.is(doc, null)
    })
})

test('findOneAndUpdate > should update a document and return it', (t) => {
  return users.insert({ name: 'Jack' }).then((doc) => {
    return users.findOneAndUpdate({ name: 'Jack' }, { $set: { name: 'Jack4' } })
  }).then((doc) => {
    t.is(doc.name, 'Jack4')
  })
})

test('findOneAndUpdate > should return null if found nothing', (t) => {
  return users.findOneAndUpdate({ name: 'Jack5' }, { $set: { name: 'Jack6' } })
    .then((doc) => {
      t.is(doc, null)
    })
})

test('findOneAndUpdate > should return an error if no atomic operations are specified', async t => {
  const err = await t.throws(users.findOneAndUpdate({ name: 'Jack5' }, { name: 'Jack6' }))
  t.is(err.message, 'the update operation document must contain atomic operators.')
})

test.cb('findOneAndUpdate > callback', (t) => {
  users.insert({ name: 'Jack2' }).then(() => {
    users.findOneAndUpdate({ name: 'Jack2' }, { $set: { name: 'Jack3' } }, (err, doc) => {
      t.is(err, null)
      t.is(doc.name, 'Jack3')
      t.end()
    })
  })
})

test('aggregate > should fail properly', (t) => {
  return users.aggregate().catch(() => {
    t.pass()
  })
})

test.cb('aggregate > should fail properly with callback', (t) => {
  users.aggregate(undefined, function (err) {
    t.truthy(err)
    t.end()
  })
})

test('aggregate > should work in normal case', (t) => {
  return users.aggregate([{$group: {_id: null, maxWoot: { $max: '$woot' }}}]).then((res) => {
    t.true(Array.isArray(res))
    t.is(res.length, 1)
  })
})

test('aggregate > should work with option', (t) => {
  return users.aggregate([{$group: {_id: null, maxWoot: { $max: '$woot' }}}], { explain: true }).then((res) => {
    t.true(Array.isArray(res))
    t.is(res.length, 1)
  })
})

test.cb('aggregate > callback', (t) => {
  users.aggregate([{$group: {_id: null, maxWoot: { $max: '$woot' }}}], t.end)
})

test('bulkWrite', (t) => {
  return users.bulkWrite([
    { insertOne: { document: { bulkWrite: 1 } } }
  ]).then((r) => {
    t.is(r.nInserted, 1)
  })
})

test.cb('bulkWrite > callback', (t) => {
  users.bulkWrite([
    { insertOne: { document: { bulkWrite: 2 } } }
  ], t.end)
})

test('should allow defaults', (t) => {
  return users.insert([{ f: true }, { f: true }, { g: true }, { g: true }]).then(() => {
    return users.update({}, { $set: { f: 'g' } })
  }).then(() => {
    users.options.safe = false
    users.options.multi = false
    return users.update({}, { $set: { g: 'h' } })
  }).then(({n}) => {
    t.true(n && n <= 1)
  }).then(() => {
    users.options.safe = true
    users.options.multi = true
    return users.update({}, { $set: { g: 'i' } }, { safe: false, multi: false })
  }).then(({n}) => {
    t.true(n && n <= 1)
  })
})

test('drop > should not throw when dropping an empty db', (t) => {
  return db.get('dropDB-' + Date.now()).drop().then(() => t.pass()).catch(() => t.fail())
})

test.cb('drop > callback', (t) => {
  db.get('dropDB2-' + Date.now()).drop(t.end)
})

test('caching collections', (t) => {
  const collectionName = 'cached-' + Date.now()
  t.is(db.get(collectionName), db.get(collectionName))
})

test('not caching collections', (t) => {
  const collectionName = 'cached-' + Date.now()
  t.not(db.get(collectionName, {cache: false}), db.get(collectionName, {cache: false}))
})

test('geoHaystackSearch', (t) => {
  return users.ensureIndex({loc: 'geoHaystack', type: 1}, {bucketSize: 1})
    .then(() => users.insert([{a: 1, loc: [50, 30]}, {a: 1, loc: [30, 50]}]))
    .then(() => users.geoHaystackSearch(50, 50, {search: {a: 1}, limit: 1, maxDistance: 100}))
    .then((r) => {
      t.is(r.length, 1)
    })
})

test.cb('geoHaystackSearch > callback', (t) => {
  users.ensureIndex({loc: 'geoHaystack', type: 1}, {bucketSize: 1})
    .then(() => users.insert([{a: 1, loc: [50, 30]}, {a: 1, loc: [30, 50]}]))
    .then(() => users.geoHaystackSearch(50, 50, {search: {a: 1}, maxDistance: 100}, t.end))
})

test('geoNear', async t => {
  const cmd = users.ensureIndex({loc2: '2d'})
    .then(() => users.insert([{a: 1, loc2: [50, 30]}, {a: 1, loc2: [30, 50]}]))
    .then(() => users.geoNear(50, 50, {query: {a: 1}, num: 1}))
    .then((r) => {
      t.is(r.length, 1)
    })

  const err = await t.throws(cmd)

  t.is(err.message, 'geoNear command is not supported anymore (see https://docs.mongodb.com/manual/reference/command/geoNear)')
})

test('mapReduce', (t) => {
  // Map function
  const map = function () { emit(this.user_id, 1) } // eslint-disable-line
  // Reduce function
  const reduce = function (k, vals) { return 1 }
  return users.insert([{user_id: 1}, {user_id: 2}])
    .then(() => users.mapReduce(map, reduce, {out: {replace: 'tempCollection'}}))
    .then((collection) => collection.findOne({'_id': 1}))
    .then((r) => {
      t.is(r.value, 1)
    })
})

test.cb('mapReduce > callback', (t) => {
  // Map function
  const map = function () { emit(this.user_id, 1) } // eslint-disable-line
  // Reduce function
  const reduce = function (k, vals) { return 1 }
  users.mapReduce(map, reduce, {out: {replace: 'tempCollection'}}, t.end)
})

test('stats', (t) => {
  return users.stats().then((res) => {
    t.truthy(res)
  })
})

test.cb('stats > callback', (t) => {
  users.stats(t.end)
})

test('findOne with a mongo client passed to the manager', (t) => {
  return users.insert({ a: 'b', c: 'd', e: 'f' }).then((doc) => {
    return monk(db._client).then((db2) => {
      return db2.get(usersName).findOne(doc._id).then(doc => {
        t.is(doc.a, 'b')
      })
    })
  })
})

import test from 'ava'

const monk = require('../lib/monk')

const db = monk('127.0.0.1/monk')
const users = db.get('users-' + Date.now())
const indexCol = db.get('index-' + Date.now())

test.after(() => {
  return users.drop()
})

test('index > should accept a field string', (t) => {
  return indexCol.index('name.first').then(indexCol.indexes).then((indexes) => {
    t.not(indexes['name.first_1'], undefined)
  })
})

test('index > should accept space-delimited compound indexes', (t) => {
  return indexCol.index('name last').then(indexCol.indexes).then((indexes) => {
    t.not(indexes.name_1_last_1, undefined)
  })
})

test('index > should accept array compound indexes', (t) => {
  return indexCol.index(['nombre', 'apellido']).then(indexCol.indexes).then((indexes) => {
    t.not(indexes.nombre_1_apellido_1, undefined)
  })
})

test('index > should accept object compound indexes', (t) => {
  return indexCol.index({ up: 1, down: -1 }).then(indexCol.indexes).then((indexes) => {
    t.not(indexes['up_1_down_-1'], undefined)
  })
})

test('index > should accept options', (t) => {
  return indexCol.index({ woot: 1 }, { unique: true }).then(indexCol.indexes).then((indexes) => {
    t.not(indexes.woot_1, undefined)
  })
})

test.cb('index > callback', (t) => {
  indexCol.index('name.third', t.end)
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

test.cb('insert > callback', (t) => {
  users.insert({ woot: 'a' }, t.end)
})

test('findById > should find by id', (t) => {
  return users.insert({ woot: 'e' }).then((doc) => {
    return users.findById(doc._id).then((doc) => {
      t.is(doc.woot, 'e')
    })
  })
})

test.cb('findById > callback', (t) => {
  users.insert({ woot: 'e' }).then((doc) => {
    return users.findById(doc._id, t.end)
  })
})

test('findOne > findOne(undefined) should not work', (t) => {
  return users.insert({ a: 'b', c: 'd', e: 'f' }).then((doc) => {
    return users.findOne()
  }).catch(() => {
    t.pass()
  })
})

test('find > should only provide selected fields', (t) => {
  return users.insert({ a: 'b', c: 'd', e: 'f' }).then((doc) => {
    return users.findOne(doc._id, 'a e')
  }).then((doc) => {
    t.is(doc.a, 'b')
    t.is(doc.e, 'f')
    t.is(doc.c, undefined)
  })
})

test.cb('find > callback', (t) => {
  users.insert({ woot: 'e' }).then((doc) => {
    return users.find(doc._id, t.end)
  })
})

test.cb('findOne > callback', (t) => {
  users.insert({ woot: 'e' }).then((doc) => {
    return users.findOne(doc._id, t.end)
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

test('find > should work with streaming', (t) => {
  const query = { stream: 1 }
  let found = 0
  return users.insert([{ stream: 1 }, { stream: 1 }, { stream: 1 }, { stream: 1 }]).then(() => {
    return users.find(query)
      .each((doc) => {
        t.not(doc.a, null)
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
        t.not(doc.a, null)
        found++
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
    return users.count(query).then((total) => {
      if (total <= 1) throw new Error('Bad test')
      return users.find(query)
        .each((doc, destroy) => {
          t.not(doc.cursor, null)
          found++
          if (found === 2) destroy()
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

test.cb('distinct > callback', (t) => {
  users.distinct('distinct', t.end)
})

test('update > should update', (t) => {
  return users.insert({ d: 'e' }).then((doc) => {
    return users.update({ _id: doc._id }, { $set: { d: 'f' } }).then(() => {
      return users.findById(doc._id)
    })
  }).then((doc) => {
    t.is(doc.d, 'f')
  })
})

test.cb('update > callback', (t) => {
  users.update({ d: 'e' }, { $set: { d: 'f' } }, t.end)
})

test('updateById > should update by id', (t) => {
  return users.insert({ d: 'e' }).then((doc) => {
    return users.updateById(doc._id, { $set: { d: 'f' } }).then(() => {
      return users.findById(doc._id)
    })
  }).then((doc) => {
    t.is(doc.d, 'f')
  })
})

test.cb('updateById > callback', (t) => {
  users.updateById('xxxxxxxxxxxx', { $set: { d: 'f' } }, t.end)
})

test('update > should update with an objectid', (t) => {
  return users.insert({ d: 'e' }).then((doc) => {
    return users.update(doc._id, { $set: { d: 'f' } }).then(() => {
      return users.findById(doc._id)
    })
  }).then((doc) => {
    t.is(doc.d, 'f')
  })
})

test('update > should update with an objectid (string)', (t) => {
  return users.insert({ d: 'e' }).then((doc) => {
    return users.update(doc._id.toString(), { $set: { d: 'f' } }).then(() => {
      return users.findById(doc._id)
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

test('removeById > should remove a document by id', (t) => {
  return users.insert({ name: 'Mathieu' }).then((doc) => {
    return users.removeById(doc._id)
  }).then(() => {
    return users.find({ name: 'Mathieu' })
  }).then((doc) => {
    t.deepEqual(doc, [])
  })
})

test.cb('removeById > callback', (t) => {
  users.removeById('xxxxxxxxxxxx', t.end)
})

test('findAndModify > should alter an existing document', (t) => {
  const rand = 'now-' + Date.now()
  return users.insert({ find: rand }).then(() => {
    return users.findAndModify({ find: rand }, { find: 'woot' }, { new: true })
  }).then((doc) => {
    t.is(doc.find, 'woot')
    return users.findById(doc._id).then((found) => {
      t.is(found._id.toString(), doc._id.toString())
      t.is(found.find, 'woot')
    })
  })
})

test('findAndModify > should accept an id as query param', (t) => {
  return users.insert({ locate: 'me' }).then((user) => {
    return users.findAndModify(user._id, { $set: { locate: 'you' } }).then(() => {
      return users.findOne(user._id)
    })
  }).then((user) => {
    t.is(user.locate, 'you')
  })
})

test('findAndModify > should accept an id as query param (mongo syntax)', (t) => {
  return users.insert({ locate: 'me' }).then((user) => {
    return users.findAndModify({ query: user._id, update: { $set: { locate: 'you' } } }).then(() => {
      return users.findOne(user._id)
    })
  }).then((user) => {
    t.is(user.locate, 'you')
  })
})

test('findAndModify > should upsert', (t) => {
  const rand = 'now-' + Date.now()

  return users.findAndModify(
      { find: rand }
    , { find: rand }
    , { upsert: true }
  ).then((doc) => {
    t.is(doc.find, rand)
    return users.findOne({ find: rand }).then((found) => {
      t.is(found._id.toString(), doc._id.toString())
      t.is(found.find, rand)
    })
  })
})

test.cb('findAndModify > callback', (t) => {
  const rand = 'now-' + Date.now()
  users.findAndModify({ query: {find: rand}, update: { find: rand } }, t.end)
})

test('aggregate > should fail properly', (t) => {
  return users.aggregate().catch(() => {
    t.pass()
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
    t.is(res.length, 2)
  })
})

test.cb('aggregate > callback', (t) => {
  users.aggregate([{$group: {_id: null, maxWoot: { $max: '$woot' }}}], t.end)
})

test('should allow defaults', (t) => {
  db.options.multi = true
  return users.insert([{ f: true }, { f: true }, { g: true }, { g: true }]).then(() => {
    return users.update({}, { $set: { f: 'g' } })
  }).then((num) => {
    t.is(typeof num, 'object')
    t.is(typeof num.n, 'number')
    t.true(num.n > 1)
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

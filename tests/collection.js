import test from 'ava'

const monk = require('../lib/monk')

const db = monk('127.0.0.1/monk')
const users = db.get('users-' + Date.now())

test.after(() => {
  return users.drop()
})

test('index > should accept a field string', (t) => {
  return users.index('name.first').then(users.indexes).then((indexes) => {
    t.not(indexes['name.first_1'], undefined)
  })
})

test('index > should accept space-delimited compound indexes', (t) => {
  return users.index('name last').then(users.indexes).then((indexes) => {
    t.not(indexes.name_1_last_1, undefined)
  })
})

test('index > should accept array compound indexes', (t) => {
  return users.index(['nombre', 'apellido']).then(users.indexes).then((indexes) => {
    t.not(indexes.nombre_1_apellido_1, undefined)
  })
})

test('index > should accept object compound indexes', (t) => {
  return users.index({ up: 1, down: -1 }).then(users.indexes).then((indexes) => {
    t.not(indexes['up_1_down_-1'], undefined)
  })
})

test('index > should accept options', (t) => {
  return users.index({ woot: 1 }, { unique: true }).then(users.indexes).then((indexes) => {
    t.not(indexes.woot_1, undefined)
  })
})

test('dropIndex > should accept a field string', (t) => {
  return users.index('name2.first').then(users.indexes).then((indexes) => {
    t.not(indexes['name2.first_1'], undefined)
  }).then(() => users.dropIndex('name2.first'))
  .then(users.indexes).then((indexes) => {
    t.is(indexes['name2.first_1'], undefined)
  })
})

test('dropIndex > should accept space-delimited compound indexes', (t) => {
  return users.index('name2 last').then(users.indexes).then((indexes) => {
    t.not(indexes.name2_1_last_1, undefined)
  }).then(() => users.dropIndex('name2 last'))
  .then(users.indexes).then((indexes) => {
    t.is(indexes.name2_1_last_1, undefined)
  })
})

test('dropIndex > should accept array compound indexes', (t) => {
  return users.index(['nombre2', 'apellido']).then(users.indexes).then((indexes) => {
    t.not(indexes.nombre2_1_apellido_1, undefined)
  }).then(() => users.dropIndex(['nombre2', 'apellido']))
  .then(users.indexes).then((indexes) => {
    t.is(indexes.nombre2_1_apellido_1, undefined)
  })
})

test('dropIndex > should accept object compound indexes', (t) => {
  return users.index({ up2: 1, down: -1 }).then(users.indexes).then((indexes) => {
    t.not(indexes['up2_1_down_-1'], undefined)
  }).then(() => users.dropIndex({ up2: 1, down: -1 }))
  .then(users.indexes).then((indexes) => {
    t.is(indexes['up2_1_down_'], undefined)
  })
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

test('findById > should find by id', (t) => {
  return users.insert({ woot: 'e' }).then((doc) => {
    return users.findById(doc._id).then((doc) => {
      t.is(doc.woot, 'e')
    })
  })
})

test('find > should only provide selected fields', (t) => {
  return users.insert({ woot: 'f', a: 'b', c: 'd', e: 'f' }).then((doc) => {
    return users.findOne(doc._id, 'a e')
  }).then((doc) => {
    t.is(doc.a, 'b')
    t.is(doc.e, 'f')
    t.is(doc.c, undefined)
  })
})

test('find > should sort', (t) => {
  return users.insert([{ woot: 'g', sort: true, a: 1, b: 2 }, { woot: 'h', sort: true, a: 1, b: 1 }]).then(() => {
    return users.find({ sort: true }, { sort: 'a b' })
  }).then((docs) => {
    t.is(docs[0].b, 1)
    t.is(docs[1].b, 2)
  })
})

test('find > should work with streaming', (t) => {
  const query = { stream: 1 }
  let found = 0
  return users.insert([{ woot: 'aa', stream: 1 }, { woot: 'ab', stream: 1 }, { woot: 'ac', stream: 1 }, { woot: 'ad', stream: 1 }]).then(() => {
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
  return users.insert([{ woot: 'ae', stream: 2 }, { woot: 'af', stream: 2 }, { woot: 'ag', stream: 2 }, { woot: 'ah', stream: 2 }]).then(() => {
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
  return users.insert([{ woot: 'i', cursor: true }, { woot: 'j', cursor: true }, { woot: 'k', cursor: true }, { woot: 'l', cursor: true }]).then(() => {
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

test('count > should count', (t) => {
  return users.count({ a: 'counting' }).then((count) => {
    t.is(count, 0)
    return users.insert({ woot: 'm', a: 'counting' })
  }).then(() => {
    return users.count({ a: 'counting' })
  }).then((count) => {
    t.is(count, 1)
  })
})

test('distinct', (t) => {
  return users.insert([{ woot: 'n', distinct: 'a' }, { woot: 'o', distinct: 'a' }, { woot: 'p', distinct: 'b' }]).then(() => {
    return users.distinct('distinct')
  }).then((docs) => {
    t.deepEqual(docs, ['a', 'b'])
  })
})

test('update > should update', (t) => {
  return users.insert({ woot: 'q', d: 'e' }).then((doc) => {
    return users.update({ _id: doc._id }, { $set: { d: 'f' } }).then(() => {
      return users.findById(doc._id)
    })
  }).then((doc) => {
    t.is(doc.d, 'f')
  })
})

test('updateById > should update by id', (t) => {
  return users.insert({ woot: 'r', d: 'e' }).then((doc) => {
    return users.updateById(doc._id, { $set: { d: 'f' } }).then(() => {
      return users.findById(doc._id)
    })
  }).then((doc) => {
    t.is(doc.d, 'f')
  })
})

test('update > should update with an objectid', (t) => {
  return users.insert({ woot: 's', d: 'e' }).then((doc) => {
    return users.update(doc._id, { $set: { d: 'f' } }).then(() => {
      return users.findById(doc._id)
    })
  }).then((doc) => {
    t.is(doc.d, 'f')
  })
})

test('update > should update with an objectid (string)', (t) => {
  return users.insert({ woot: 't', d: 'e' }).then((doc) => {
    return users.update(doc._id.toString(), { $set: { d: 'f' } }).then(() => {
      return users.findById(doc._id)
    })
  }).then((doc) => {
    t.is(doc.d, 'f')
  })
})

test('remove > should remove a document', (t) => {
  return users.insert({ woot: 'u', name: 'Tobi' }).then((doc) => {
    return users.remove({ name: 'Tobi' })
  }).then(() => {
    return users.find({ name: 'Tobi' })
  }).then((doc) => {
    t.deepEqual(doc, [])
  })
})

test('removeById > should remove a document by id', (t) => {
  return users.insert({ woot: 'v', name: 'Mathieu' }).then((doc) => {
    return users.removeById(doc._id)
  }).then(() => {
    return users.find({ name: 'Mathieu' })
  }).then((doc) => {
    t.deepEqual(doc, [])
  })
})

test('findAndModify > should alter an existing document', (t) => {
  const rand = 'now-' + Date.now()
  return users.insert({ find: rand, woot: 'w' }).then(() => {
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
  return users.insert({ locate: 'me', woot: 'x' }).then((user) => {
    return users.findAndModify(user._id, { $set: { locate: 'you' } }).then(() => {
      return users.findOne(user._id)
    })
  }).then((user) => {
    t.is(user.locate, 'you')
  })
})

test('findAndModify > should accept an id as query param (mongo syntax)', (t) => {
  return users.insert({ locate: 'me', woot: 'y' }).then((user) => {
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
    , { find: rand, woot: 'z' }
    , { upsert: true }
  ).then((doc) => {
    t.is(doc.find, rand)
    return users.findOne({ find: rand }).then((found) => {
      t.is(found._id.toString(), doc._id.toString())
      t.is(found.find, rand)
    })
  })
})

test('should allow defaults', (t) => {
  db.options.multi = true
  return users.insert([{ woot: 'ba', f: true }, { woot: 'bb', f: true }, { woot: 'bc', g: true }, { woot: 'bd', g: true }]).then(() => {
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

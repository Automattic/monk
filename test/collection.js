/*global expect*/

var monk = require('../lib/monk')
  , db
  , users, indexes;

describe('collection', function () {
  before(function () {
    db = monk('127.0.0.1/monk');
    users = db.get('users-' + Date.now());
    indexes = db.get('indexes-' + Date.now());
  });

  describe('casting method', function () {
    it('string -> oid', function () {
      var oid = users.id('4ee0fd75d6bd52107c000118');
      expect(oid.toHexString()).to.equal('4ee0fd75d6bd52107c000118');
    });

    it('oid -> oid', function () {
      var oid = users.id(users.id('4ee0fd75d6bd52107c000118'));
      expect(oid.toHexString()).to.equal('4ee0fd75d6bd52107c000118');
    });

    it('new oid', function () {
      var oid = users.id();
      expect(oid.toHexString()).to.be.a('string');
    });

    it('#oid', function(){
      var oid = users.oid();
      expect(oid.toHexString()).to.be.a('string');
    });
  });

  describe('indexes', function () {
    it('should accept a field string', function (done) {
      users.index('name.first', function (err) {
        expect(err).to.be(null);
        users.indexes(function (err, indexes) {
          expect(err).to.be(null);
          expect(indexes['name.first_1']).to.not.be(undefined);
          done();
        });
      });
    });

    it('should accept space-delimited compound indexes', function (done) {
      users.index('name last', function (err) {
        expect(err).to.be(null);
        users.indexes(function (err, indexes) {
          expect(err).to.be(null);
          expect(indexes.name_1_last_1).to.not.be(undefined);
          done();
        });
      });
    });

    it('should accept array compound indexes', function (done) {
      users.index(['nombre', 'apellido'], function (err) {
        expect(err).to.be(null);
        users.indexes(function (err, indexes) {
          expect(err).to.be(null);
          expect(indexes.nombre_1_apellido_1).to.not.be(undefined);
          done();
        });
      });
    });

    it('should accept object compound indexes', function (done) {
      users.index({ up: 1, down: -1 }, function (err) {
        expect(err).to.be(null);
        users.indexes(function (err, indexes) {
          expect(err).to.be(null);
          expect(indexes['up_1_down_-1']).to.not.be(undefined);
          done();
        });
      });
    });

    it('should accept options', function (done) {
      indexes.index({ woot: 1 }, { unique: true }, function (err) {
        expect(err).to.be(null);
        indexes.indexes(function (err, indexes) {
          expect(err).to.be(null);
          expect(indexes.woot_1).to.not.be(undefined);
          done();
        });
      });
    });
  });

  describe('inserting', function () {
    it('should force callback in next tick', function (done) {
      var p = users.insert({ a: 'b' });
      p.complete(done);
    });

    it('should give you an object with the _id', function (done) {
      var p = users.insert({ a: 'b' }, function (err, obj) {
        expect(obj._id).to.be.an('object');
        expect(obj._id.toHexString).to.not.be(undefined);
        done();
      });
    });
  });

  describe('finding', function () {
    it('should find by id', function (done) {
      users.insert({ c: 'd' }, function (err, doc) {
        expect(err).to.be(null);
        users.findById(doc._id, function (err, doc) {
          expect(err).to.be(null);
          expect(doc.c).to.be('d');
          done();
        });
      });
    });

    it('should only provide selected fields', function (done) {
      users.insert({ a: 'b', c: 'd', e: 'f' }, function (err, doc) {
        expect(err).to.be(null);
        users.findOne(doc._id, 'a e', function (err, doc) {
          expect(err).to.be(null);
          expect(doc.a).to.be('b');
          expect(doc.e).to.be('f');
          expect(doc.c).to.be(undefined);
          done();
        });
      });
    });

    it('should work with streaming', function (done) {
      var query = { a: { $exists: true } }
        , found = 0;
      users.count(query, function (err, total) {
        users.find(query)
          .each(function (doc) {
            expect(doc.a).to.not.eql(null);
            found++;
          })
          .error(function (err) {
            done(err);
          })
          .success(function () {
            expect(found).to.be(total);
            done();
          });
      });
    });

    it('should work with streaming option', function (done) {
      var query = { a: { $exists: true } }
        , found = 0;
      users.count(query, function (err, total) {
        var promise = users.find(query, { stream: true });
        process.nextTick(function () {
          promise
            .each(function (doc) {
              expect(doc.a).to.not.eql(null);
              found++;
            })
            .error(function (err) {
              done(err);
            })
            .success(function () {
              expect(found).to.be(total);
              done();
            });
        });
      });
    });
  });

  describe('counting', function () {
    it('should work', function (done) {
      users.count({ a: 'counting' }, function (err, count) {
        expect(err).to.be(null);
        expect(count).to.be(0);

        users.insert({ a: 'counting' }, function (err) {
          expect(err).to.be(null);

          users.count({ a: 'counting' }, function (err, count) {
            expect(err).to.be(null);
            expect(count).to.be(1);
            done();
          });
        });
      });
    });
  });

  describe('updating', function () {
    it('should update', function (done) {
      users.insert({ d: 'e' }, function (err, doc) {
        expect(err).to.be(null);
        var p = users.update({ _id: doc._id }, { $set: { d: 'f' } });
        p.complete(function (err) {
          expect(err).to.be(null);
          users.findById(doc._id, function (err, doc) {
            expect(err).to.be(null);
            expect(doc.d).to.be('f');
            done();
          });
        });
      });
    });

    it('should work with an objectid', function (done) {
      users.insert({ worked: false }, function (err, doc) {
        expect(err).to.be(null);
        users.update(doc._id, { $set: { worked: true } }, function (err) {
          expect(err).to.be(null);
          users.findOne(doc._id, function (err, doc) {
            expect(err).to.be(null);
            expect(doc.worked).to.be(true);
            done();
          });
        });
      });
    });

    it('should work with an objectid (string)', function (done) {
      users.insert({ worked: false }, function (err, doc) {
        expect(err).to.be(null);
        users.update(doc._id.toString(), { $set: { worked: true } }, function (err) {
          expect(err).to.be(null);
          users.findOne(doc._id, function (err, doc) {
            expect(err).to.be(null);
            expect(doc.worked).to.be(true);
            done();
          });
        });
      });
    });
  });

  describe('remove', function () {
    it('should remove a document', function (done) {
      users.insert({ name: 'Tobi' }, function (err, doc) {
        if (err) return done(err);
        users.remove({ name: 'Tobi' }, function (err) {
          if (err) return done(err);
          users.find({ name: 'Tobi' }, function (err, doc) {
            if (err) return done(err);
            expect(doc).to.eql([]);
            done();
          });
        });
      });
    });
  });

  describe('findAndModifying', function () {
    it('should alter an existing document', function (done) {
      var rand = 'now-' + Date.now();
      users.insert({ find: rand }, function (err, doc) {
        expect(err).to.be(null);
        users.findAndModify({ find: rand }, { find: 'woot' }, { new: true }, function (err, doc) {
          expect(err).to.be(null);
          expect(doc.find).to.be('woot');
          users.findById(doc._id, function (err, found) {
            expect(err).to.be(null);
            expect(found._id.toString()).to.equal(doc._id.toString());
            expect(found.find).to.be('woot');
            done();
          });
        });
      });
    });

    it('should accept an id as query param', function(done){
      users.insert({ locate: 'me' }, function(err, user){
        expect(err).to.be(null);
        users.findAndModify(user._id, { $set: { locate: 'you' } }, function(err){
          expect(err).to.be(null);
          users.findOne(user._id, function(err, user){
            expect(err).to.be(null);
            expect(user.locate).to.be('you');
            done();
          });
        });
      });
    });

    it('should accept an id as query param (mongo syntax)', function(done){
      users.insert({ locate: 'me' }, function(err, user){
        expect(err).to.be(null);
        users.findAndModify({ query: user._id, update: { $set: { locate: 'you' } } }, function(err){
          expect(err).to.be(null);
          users.findOne(user._id, function(err, user){
            expect(err).to.be(null);
            expect(user.locate).to.be('you');
            done();
          });
        });
      });
    });

    it('should upsert', function (done) {
      function callback (err, doc) {
        if (err) return done(err);
        expect(doc.find).to.be(rand);
        users.findOne({ find: rand }, function (err, found) {
          expect(err).to.be(null);
          expect(found._id.toString()).to.be(doc._id.toString());
          expect(found.find).to.be(rand);
          done();
        });
      };

      var rand = 'now-' + Date.now();

      users.findAndModify(
          { find: rand }
        , { find: rand }
        , { upsert: true }
        , callback
      );
    });
  });

  describe('options', function () {
    it('should allow defaults', function (done) {
      db.options.multi = true;
      users.update({}, { $set: { f: 'g' } }, function (err, num) {
        expect(err).to.be(null);
        expect(num).to.be.a('number'); // only a number of multi=true

        users.options.safe = false;
        users.options.multi = false;
        users.update({}, { $set: { g: 'h' } }, function (err, num) {
          expect(err).to.be(null);
          expect(num).to.be(undefined);

          users.options.safe = true;
          users.options.multi = true;
          users.update({}, { $set: { g: 'h' } }, { safe: false, multi: false }, function (err, num) {
            expect(err).to.be(null);
            expect(num).to.be(undefined);
            done();
          });
        });
      });
    });
  });

  describe('promises', function () {
    var Promise = monk.Promise;

    it('insert', function () {
      var p = users.insert();
      expect(p).to.be.a(Promise);
      expect(p.col).to.be(users);
      expect(p.type).to.be('insert');
    });

    it('findOne', function () {
      var p = users.findOne();
      expect(p).to.be.a(Promise);
      expect(p.col).to.be(users);
      expect(p.type).to.be('findOne');
    });

    it('find', function () {
      var p = users.findOne();
      expect(p).to.be.a(Promise);
      expect(p.col).to.be(users);
      expect(p.type).to.be('findOne');
    });

    it('update', function () {
      var p = users.findOne();
      expect(p).to.be.a(Promise);
      expect(p.col).to.be(users);
      expect(p.type).to.be('findOne');
    });

    it('findAndModify', function () {
      var p = users.findAndModify();
      expect(p).to.be.a(Promise);
      expect(p.col).to.be(users);
      expect(p.type).to.be('findAndModify');
    });

    it('remove', function () {
      var p = users.remove();
      expect(p).to.be.a(Promise);
      expect(p.col).to.be(users);
      expect(p.type).to.be('remove');
    });

    it('index', function () {
      var p = users.index('eee');
      expect(p).to.be.a(Promise);
      expect(p.col).to.be(users);
      expect(p.type).to.be('index');
    });

    it('indexes', function () {
      var p = users.indexes();
      expect(p).to.be.a(Promise);
      expect(p.col).to.be(users);
      expect(p.type).to.be('indexes');
    });

    it('drop', function (done) {
      var col = db.get('drop-' + Date.now());
      col.insert({}, function (err) {
        expect(err).to.be(null);
        var p = col.drop(done);
        expect(p).to.be.a(Promise);
        expect(p.type).to.be('drop');
      });
    });
  });

  after(function (done) {
    users.drop(function (err) {
      expect(err).to.be(null);
      indexes.drop(done);
    });
  });
});

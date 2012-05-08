
var monk = require('../lib/monk')
  , db
  , users, indexes

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
        if (err) return done(err);
        users.findById(doc._id, function (err, doc) {
          if (err) return done(err);
          expect(doc.c).to.be('d');
          done();
        });
      });
    });
  });

  describe('updating', function () {
    it('should update', function (done) {
      users.insert({ d: 'e' }, function (err, doc) {
        if (err) return done(err);
        var p = users.update({ _id: doc._id }, { $set: { d: 'f' } });
        p.complete(function (err) {
          if (err) return done(err);
          users.findById(doc._id, function (err, doc) {
            if (err) return done(err);
            expect(doc.d).to.be('f');
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
      var p = users.findOne();
      expect(p).to.be.a(Promise);
      expect(p.col).to.be(users);
      expect(p.type).to.be('findOne');
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
        if (err) return done(err);
        var p = col.drop(done)
        expect(p).to.be.a(Promise);
        expect(p.type).to.be('drop');
      });
    });
  });

  after(function (done) {
    users.drop(function (err) {
      if (err) return done(err);
      indexes.drop(done);
    });
  });
});

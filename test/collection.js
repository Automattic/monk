
var monk = require('../lib/monk')
  , db
  , users

describe('collection', function () {
  before(function () {
    db = monk('127.0.0.1/monk-' + Date.now());
    users = db.get('users');
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
      users.index({ woot: 1 }, { unique: true }, function (err) {
        expect(err).to.be(null);
        users.indexes(function (err, indexes) {
          expect(err).to.be(null);
          expect(indexes.woot_1).to.not.be(undefined);
          done();
        });
      });
    });
  });

  describe('promises', function () {
    var Promise = monk.Promise;

    it('insert', function () {
      var p = users.insert();
      expect(p).to.be.a(Promise);
      expect(p.type).to.be('insert');
    });

    it('findOne', function () {
      var p = users.findOne();
      expect(p).to.be.a(Promise);
      expect(p.type).to.be('findOne');
    });

    it('find', function () {
      var p = users.findOne();
      expect(p).to.be.a(Promise);
      expect(p.type).to.be('findOne');
    });

    it('update', function () {
      var p = users.findOne();
      expect(p).to.be.a(Promise);
      expect(p.type).to.be('findOne');
    });

    it('findAndModify', function () {
      var p = users.findOne();
      expect(p).to.be.a(Promise);
      expect(p.type).to.be('findOne');
    });

    it('remove', function () {
      var p = users.findOne();
      expect(p).to.be.a(Promise);
      expect(p.type).to.be('findOne');
    });

    it('index', function () {
      var p = users.findOne();
      expect(p).to.be.a(Promise);
      expect(p.type).to.be('findOne');
    });

    it('indexes', function () {
      var p = users.findOne();
      expect(p).to.be.a(Promise);
      expect(p.type).to.be('findOne');
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
    users.drop(done);
  });
});

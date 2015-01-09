/*global expect*/

var monk = require('../lib/monk');

describe('monk', function () {

  describe('constructor', function () {
    it('Manager', function () {
      expect(monk).to.be.a('function');
      expect(monk.name).to.be('Manager');
    });

    it('Collection', function () {
      expect(monk.Collection).to.be.a('function');
      expect(monk.Collection.name).to.be('Collection');
    });

    it('Promise', function () {
      expect(monk.Promise).to.be.a('function');
      expect(monk.Promise.name).to.be('Promise');
    });
  });

  describe('connection', function () {
    it('to a regular server', function (done) {
      monk('127.0.0.1/monk-test', done);
    });

    it('to a replica set (array)', function (done) {
      monk(['127.0.0.1/monk-test', 'localhost/monk-test'], done);
    });

    it('to a replica set (string)', function (done) {
      monk('127.0.0.1,localhost/monk-test', done);
    });

    it('followed by disconnection', function (done) {
      var db = monk('127.0.0.1/monk-test', function () {
        db.close(done);
      });
    });
  });

  describe('collections', function () {
    var Collection = monk.Collection;
    var db = monk('127.0.0.1/monk-test');

    it('Manager#get', function () {
      expect(db.get('users')).to.be.a(Collection);
    });

    it('Manager#col', function(){
      expect(db.col('users')).to.be.a(Collection);
    });
  });

  describe('ObjectID casting', function(){
    var db = monk('127.0.0.1/monk-test');

    it('Manager#id', function(){
      var oid = db.id();
      expect(oid.toHexString()).to.be.a('string');
    });

    it('Manager#oid', function(){
      var oid = db.oid();
      expect(oid.toHexString()).to.be.a('string');
    });
  });

});

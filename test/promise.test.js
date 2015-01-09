
var Promise = require('../lib/monk').Promise

describe('promise', function () {

  it('Promise#type', function () {
    var p = new Promise(null, 'woot');
    expect(p.type).to.be('woot');
  });

  it('Promise#error', function () {
    var p = new Promise()
    p.error(function(){});
    // 2 due to internal event listener
    expect(p.listeners('error').length).to.be(2);
  });

  it('Promise#success', function () {
    var p = new Promise()
    p.success(function(){});
    // 2 due to internal event listener
    expect(p.listeners('success').length).to.be(2);
  });

  it('Promise#complete', function () {
    var p = new Promise()
    p.complete(function(){});
    // 2 due to internal event listener
    expect(p.listeners('error').length).to.be(2);
    expect(p.listeners('success').length).to.be(2);
  });

  it('Promise#each', function () {
    var p = new Promise()
    p.each(function(){});
    expect(p.listeners('each').length).to.be(1);
  });

  it('Promise#then', function () {
    var p = new Promise()
      , runCount = 0;

    p.then(function() {
      ++runCount;
    });

    p.fulfill();

    setTimeout(function () {
      expect(runCount).to.be(1);
    }, 10);
  });

  it('Promise#then-chain', function () {
    var p = new Promise()
      , runCount = 0;

    p.then(function () {
      ++runCount;
      return (new Promise()).fulfill();
    }).then(function () {
      ++runCount;
    });

    p.fulfill();

    setTimeout(function () {
      expect(runCount).to.be(2);
    }, 10);
  });

  it('Promise#reject', function (done) {
    var p = new Promise()
    p.error(function(err){
      expect(err).to.be('foo');
      done();
    });
    p.reject('foo');
  });

  it('Promise#fulfill', function (done) {
    var p = new Promise()
    p.success(function(data){
      expect(data).to.be('bar');
      done();
    });
    p.fulfill('bar');
  });

  it('Promise#resolve-err', function (done) {
    var p = new Promise()
    p.complete(function(err, data){
      expect(err).to.be('foo');
      done();
    });
    p.resolve('foo');
  });

  it('Promise#resolve-data', function (done) {
    var p = new Promise()
    p.complete(function(err, data){
      expect(err).to.not.be.ok();
      expect(data).to.be('bar');
      done();
    });
    p.resolve(null, 'bar');
  });

  it('Promise#complete-err', function (done) {
    var p = new Promise()
    p.on('complete', function(err, data){
      expect(err).to.be('foo');
      done();
    });
    p.resolve('foo');
  });

  it('Promise#complete-data', function (done) {
    var p = new Promise()
    p.on('complete', function(err, data){
      expect(err).to.not.be.ok();
      expect(data).to.be('bar');
      done();
    });
    p.resolve(null, 'bar');
  });

});

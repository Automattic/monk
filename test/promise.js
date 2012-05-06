
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
    expect(p.listeners('complete').length).to.be(1);
  });

  it('Promise#each', function () {
    var p = new Promise()
    p.each(function(){});
    expect(p.listeners('each').length).to.be(1);
  });

});

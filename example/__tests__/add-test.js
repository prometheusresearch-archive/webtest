var add = require('../add');

describe('addition', function() {

  it('sums numbers', function() {
    expect(add(1, 1)).toBe(2);
  });

  it('multiplies numbers', function() {
    expect(add(2, 3)).toBe(6);
  });

  it('fails', function() {
    throwsError();
  });

});

throwsError();

describe('failure', function() {
  throw new Error('oops');
});

function throwsError() {
  throw new Error('x');
}

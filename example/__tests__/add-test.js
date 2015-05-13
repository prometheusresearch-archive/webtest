var add = require('../add');

describe('addition', function() {

  it('sums numbers', function() {
    expect(add(1, 1)).toBe(2);
  });

  it('multiplies numbers', function() {
    expect(add(1, 1)).toBe(2);
  });

  it('fails', function() {
    expect(add(1, 1)).toBe(2);
  });

});

function throwsError() {
  throw new Error('x');
}

const { NumericDate } = require('./helpers');

describe('NumericDate function', () => {
  describe('with a date that could be rounded up', () => {
    const date = new Date(1233999);
    it('Returns the date in whole seconds since epoch', () => {
      expect(NumericDate(date)).to.equal(1233);
    });
  });
  describe('with a date that would not be rounded up', () => {
    const date = new Date(1234000);
    it('Returns the date in whole seconds since epoch', () => {
      expect(NumericDate(date)).to.equal(1234);
    });
  });
});

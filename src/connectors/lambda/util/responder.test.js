const responder = require('./responder');

jest.mock('../../../config', () => ({
  STATIC_SECURITY_HEADERS: {
    Foo: 'Bar'
  }
}));

describe('responder', () => {
  const expectRequestHeadersToIncludeStaticSecurityHeaders = done => (
    ignored,
    request
  ) => {
    expect(request.headers).to.include({
      Foo: 'Bar'
    });
    done();
  };

  describe('success', () => {
    it('includes the static security headers in the response', done => {
      responder(
        expectRequestHeadersToIncludeStaticSecurityHeaders(done)
      ).success('body');
    });
  });

  describe('error', () => {
    it('includes the static security headers in the response', done => {
      responder(expectRequestHeadersToIncludeStaticSecurityHeaders(done)).error(
        { message: 'some error' },
        418
      );
    });
  });

  describe('redirect', () => {
    it('includes the static security headers in the response', done => {
      responder(
        expectRequestHeadersToIncludeStaticSecurityHeaders(done)
      ).redirect('http://redirect');
    });
  });
});

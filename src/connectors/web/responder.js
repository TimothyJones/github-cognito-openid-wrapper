const util = require('util');

const { STATIC_SECURITY_HEADERS } = require('../../config');

require('colors');

module.exports = res => ({
  success: data => {
    res.format({
      'application/json': () => {
        res.set(STATIC_SECURITY_HEADERS).json(data);
      },
      default: () => {
        res
          .status(406)
          .set(STATIC_SECURITY_HEADERS)
          .send('Not Acceptable');
      }
    });
  },
  error: (error, statusCode = 400) => {
    res
      .status(statusCode)
      .set(STATIC_SECURITY_HEADERS)
      .end(`Failure: ${util.inspect(error.message)}`);
  },
  redirect: url => res.set(STATIC_SECURITY_HEADERS).redirect(url)
});

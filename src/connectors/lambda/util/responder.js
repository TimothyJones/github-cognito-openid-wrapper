const { STATIC_SECURITY_HEADERS } = require('../../../config');

module.exports = callback => ({
  success: body => {
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(body),
      headers: {
        ...STATIC_SECURITY_HEADERS,
        'Content-Type': 'application/json'
      }
    });
  },
  error: (err, statusCode = 500) => {
    callback(null, {
      body: JSON.stringify(err.message),
      headers: {
        ...STATIC_SECURITY_HEADERS,
        'Content-Type': 'application/json'
      },
      statusCode
    });
  },
  redirect: url => {
    callback(null, {
      statusCode: 302,
      headers: {
        ...STATIC_SECURITY_HEADERS,
        'Content-Type': 'text/html',
        Location: url
      }
    });
  }
});

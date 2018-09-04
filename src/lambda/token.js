const qs = require('querystring');
const responder = require('./util/responder');
const auth = require('./util/auth');
const openid = require('../openid');

const parseBody = event => {
  const contentType = event.headers['Content-Type'];
  if (event.body) {
    if (contentType.startsWith('application/x-www-form-urlencoded')) {
      return qs.parse(event.body);
    }
    if (contentType.startsWith('application/json')) {
      return JSON.parse(event.body);
    }
  }
  return {};
};

module.exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const body = parseBody(event);
  const query = event.queryStringParameters || {};

  const code = body.code || query.code;
  const state = body.state || query.state;

  const respond = responder(callback);

  if (code) {
    openid
      .getTokens(code, state, auth.getIssuer(event.headers.Host))
      .then(tokens => {
        respond.success(tokens);
      })
      .catch(error => {
        respond.error(error);
      });
  } else {
    respond.error(new Error('No code supplied'));
  }
};

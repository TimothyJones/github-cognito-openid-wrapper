const qs = require('querystring');
const responder = require('./util/responder');
const auth = require('./util/auth');
const controllers = require('../controllers');

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
  const body = parseBody(event);
  const query = event.queryStringParameters || {};

  const code = body.code || query.code;
  const state = body.state || query.state;

  controllers(responder(callback)).token(
    code,
    state,
    auth.getIssuer(event.headers.Host, event.requestContext && event.requestContext.stage)
  );
};

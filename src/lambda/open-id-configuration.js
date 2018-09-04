const responder = require('./util/responder');
const auth = require('./util/auth');
const openid = require('../openid');

module.exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  responder(callback).success(
    openid.getConfigFor(auth.getIssuer(event.headers.Host))
  );
};

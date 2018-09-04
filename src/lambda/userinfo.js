const responder = require('./util/responder');
const auth = require('./util/auth');
const openid = require('../openid');

module.exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  const respond = responder(callback);

  auth
    .getBearerToken(event)
    .then(token => openid.getUserInfo(token))
    .then(userInfo => {
      respond.success(userInfo);
    })
    .catch(respond.error);
};

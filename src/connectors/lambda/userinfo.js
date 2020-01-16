const responder = require('./util/responder');
const auth = require('./util/auth');
const controllers = require('../controllers');
const keepAlive = require('./util/keepAlive');

const handler = (event, context, callback) => {
  controllers(responder(callback)).userinfo(auth.getBearerToken(event));
};
module.exports.handler = keepAlive(handler);

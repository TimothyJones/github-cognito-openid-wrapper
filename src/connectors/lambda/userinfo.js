const responder = require('./util/responder');
const auth = require('./util/auth');
const controllers = require('../controllers');

module.exports.handler = (event, context, callback) => {
  controllers(responder(callback)).userinfo(auth.getBearerToken(event));
};

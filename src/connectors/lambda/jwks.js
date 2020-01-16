const responder = require('./util/responder');
const controllers = require('../controllers');
const keepAlive = require('./util/keepAlive');

const handler = (event, context, callback) => {
  controllers(responder(callback)).jwks();
};

module.exports.handler = keepAlive(handler);

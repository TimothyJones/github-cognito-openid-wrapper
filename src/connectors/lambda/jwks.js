const responder = require('./util/responder');
const controllers = require('../controllers');

module.exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  controllers(responder(callback)).jwks();
};

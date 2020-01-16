const responder = require('./util/responder');
const cognitoStates = require('../states');
const controllers = require('../controllers');
const keepAlive = require('./util/keepAlive');

const handler = (event, context, callback) =>
  controllers(responder(callback)).authorize(
    event.queryStringParameters,
    cognitoStates
  );

module.exports.handler = keepAlive(handler);

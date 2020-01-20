const responder = require('./util/responder');
const controllers = require('../controllers');
const cognitoStates = require('../states');

module.exports.handler = (event, context, callback) => {
  const query = event.queryStringParameters || {};
  controllers(responder(callback)).callback(query, cognitoStates);
};

const responder = require('./util/responder');
const controllers = require('../controllers');
const cognitoStates = require('../states');
const logger = require("../../connectors/logger");

module.exports.handler = (event, context, callback) => {
  const query = event.queryStringParameters || {};
  logger.info(`query: ${query}`);
  controllers(responder(callback)).callback(query, cognitoStates);
};

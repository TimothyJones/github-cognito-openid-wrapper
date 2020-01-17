const responder = require('./util/responder');
const controllers = require('../controllers');
const cognitoStates = require('../states');
const logger = require("../../connectors/logger");

module.exports.handler = (event, context, callback) => {
  // const {
  //   client_id,
  //   scope,
  //   state,
  //   response_type
  // } = event.queryStringParameters;

  const query = event.queryStringParameters || {};

  logger.info(`query: ${query}`);

  controllers(responder(callback)).callback(query);
};

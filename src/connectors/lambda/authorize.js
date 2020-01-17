const responder = require('./util/responder');
const controllers = require('../controllers');
const cognitoStates = require('../states');
const logger = require("../../connectors/logger");

module.exports.handler = (event, context, callback) => {
  const {
    client_id,
    scope,
    state,
    response_type
  } = event.queryStringParameters;

  logger.info(`cognitoStates ${JSON.stringify(cognitoStates)}`);

  controllers(responder(callback)).authorize(
    client_id,
    scope,
    state,
    response_type,
    cognitoStates
  );
};

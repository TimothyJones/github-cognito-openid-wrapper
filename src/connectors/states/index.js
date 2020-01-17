const uuidv4 = require('uuid/v4');
const { dynamoGet, dynamoPut } = require('./dynamodb');
const logger = require("../../connectors/logger");

module.exports = {
  save: value => {
    const id = uuidv4();
    logger.info(`i-id: ${id}`);
    return dynamoPut(id, value).then(() => id);
  },
  get: id =>
    dynamoGet(id).then(
      response => (response.Item ? response.Item.CognitoState : null)
    )
};

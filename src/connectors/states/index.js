const uuidv4 = require('uuid/v4');
const { dynamoGet, dynamoPut } = require('./dynamodb');

module.exports = {
  save: value => {
    const id = uuidv4();
    return dynamoPut(id, value).then(() => id);
  },
  get: id =>
    dynamoGet(id).then(
      response => (response.Item ? response.Item.CognitoState : null)
    )
};

const AWS = require('aws-sdk');

const { STATE_DYNAMODB_TABLE, DYNAMODB_ENDPOINT } = require('../../config');

const stateClient = new AWS.DynamoDB.DocumentClient({
  endpoint: DYNAMODB_ENDPOINT,
  region: 'ap-southeast-2',
  convertEmptyValues: true
});

const getTimePlusSecondsFromNow = seconds =>
  Math.floor(Date.now() / 1000) + seconds;

const dynamoGet = uuid =>
  stateClient
    .get({
      TableName: STATE_DYNAMODB_TABLE,
      Key: {
        Uuid: uuid
      }
    })
    .promise();

const dynamoPut = (id, value) =>
  stateClient
    .put({
      TableName: STATE_DYNAMODB_TABLE,
      Item: {
        Uuid: id,
        CognitoState: value,
        TimeToLive: getTimePlusSecondsFromNow(300)
      }
    })
    .promise();

module.exports = { dynamoGet, dynamoPut };

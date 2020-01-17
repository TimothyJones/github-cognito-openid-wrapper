const AWS = require('aws-sdk');

const { DYNAMODB_STATE_TABLE } = require('../../config');

const stateClient = new AWS.DynamoDB.DocumentClient({
  region: 'us-east-1',
  convertEmptyValues: true
});

const getTimePlusSecondsFromNow = seconds =>
  Math.floor(Date.now() / 1000) + seconds;

const dynamoGet = id =>
  stateClient
    .get({
      TableName: DYNAMODB_STATE_TABLE,
      Key: { id }
    })
    .promise();

const dynamoPut = (id, value) =>
  stateClient
    .put({
      TableName: DYNAMODB_STATE_TABLE,
      Item: {
        id,
        state: value,
        TimeToLive: getTimePlusSecondsFromNow(300)
      }
    })
    .promise();

module.exports = { dynamoGet, dynamoPut };

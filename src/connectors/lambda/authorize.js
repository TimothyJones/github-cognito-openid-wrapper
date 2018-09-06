const responder = require('./util/responder');

module.exports.handler = (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const {
    client_id,
    scope,
    state,
    response_type
  } = event.queryStringParameters;

  responder(callback).redirect(
    `https://github.com/login/oauth/authorize?client_id=${client_id}&scope=${scope}&state=${state}&response_type=${response_type}`
  );
};

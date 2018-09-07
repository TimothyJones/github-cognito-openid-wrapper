const responder = require('./util/responder');

module.exports.handler = (event, context, callback) => {
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

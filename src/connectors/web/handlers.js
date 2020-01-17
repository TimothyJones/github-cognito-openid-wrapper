const responder = require('./responder');
const auth = require('./auth');
const controllers = require('../controllers');
const cognitoStates = require('../states');

module.exports = {
  userinfo: (req, res) => {
    controllers(responder(res)).userinfo(auth.getBearerToken(req));
  },
  token: (req, res) => {
    const code = req.body.code || req.query.code;
    const state = req.body.state || req.query.state;

    controllers(responder(res)).token(
      code,
      state,
      req.get('host'),
      `https://${req.get('host')}/callback`
    );
  },
  jwks: (req, res) => controllers(responder(res)).jwks(),
  authorize: (req, res) =>
    controllers(responder(res)).authorize(req.query, cognitoStates)
  ,
  openIdConfiguration: (req, res) => {
    controllers(responder(res)).openIdConfiguration(
      auth.getIssuer(req.get('host'))
    );
  },
  callback: (req, res) =>
    controllers(responder(res)).loginCallback(req.query, cognitoStates),
};

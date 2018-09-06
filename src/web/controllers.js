const respond = require('./respond');
const auth = require('./auth');
const openid = require('../openid');

module.exports = {
  userInfo: (req, res) => {
    auth
      .getBearerToken(req)
      .then(token => openid.getUserInfo(token))
      .then(userInfo => {
        respond.success(res, userInfo);
      })
      .catch(error => {
        respond.error(res, error);
      });
  },
  token: (req, res) => {
    const code = req.body.code || req.query.code;
    const state = req.body.state || req.query.state;
    if (code) {
      openid
        .getTokens(code, state, req.get('host'))
        .then(tokens => {
          respond.success(res, tokens);
        })
        .catch(error => {
          respond.error(res, error);
        });
    } else {
      respond.error(res, new Error('No code supplied'));
    }
  },
  jwks: (req, res) => respond.success(res, openid.getJwks()),
  authorize: (req, res) =>
    res.redirect(
      `https://github.com/login/oauth/authorize?client_id=${
        req.query.client_id
      }&scope=${req.query.scope}&state=${req.query.state}&response_type=${
        req.query.response_type
      }`
    ),
  openIdConfiguration: (req, res) => {
    const host = req.get('host');
    const config = openid.getConfigFor(host);

    respond.success(res, config);
  }
};

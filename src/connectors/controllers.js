const openid = require('../openid');

module.exports = respond => ({
  authorize: (client_id, scope, state, response_type) => {
    const authorizeUrl = openid.getAuthorizeUrl(client_id, scope, state, response_type);
    respond.redirect(authorizeUrl);
  },
  userinfo: tokenPromise => {
    tokenPromise
      .then(token => openid.getUserInfo(token))
      .then(userInfo => {
        respond.success(userInfo);
      })
      .catch(error => {
        respond.error(error);
      });
  },
  token: (code, state, host) => {
    if (code) {
      openid
        .getTokens(code, state, host)
        .then(tokens => {
          respond.success(tokens);
        })
        .catch(error => {
          respond.error(error);
        });
    } else {
      respond.error(new Error('No code supplied'));
    }
  },
  jwks: () => respond.success(openid.getJwks()),
  openIdConfiguration: host => {
    const config = openid.getConfigFor(host);
    respond.success(config);
  }
});

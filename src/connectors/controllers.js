const openid = require('../openid');

module.exports = respond => ({
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

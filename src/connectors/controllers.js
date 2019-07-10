const logger = require('./logger');
const openid = require('../openid');

module.exports = respond => ({
  authorize: (client_id, scope, state, response_type) => {
    const authorizeUrl = openid.getAuthorizeUrl(client_id, scope, state, response_type);
    logger.info("Redirecting to %s", authorizeUrl);
    respond.redirect(authorizeUrl);
  },
  userinfo: tokenPromise => {
    tokenPromise
      .then(token => openid.getUserInfo(token))
      .then(userInfo => {
        logger.info("Resolved user infos:", userInfo);
        respond.success(userInfo);
      })
      .catch(error => {
        logger.error("Failed to provide user info: %s", error.message || error);
        respond.error(error);
      });
  },
  token: (code, state, host) => {
    if (code) {
      openid
        .getTokens(code, state, host)
        .then(tokens => {
          logger.info("Token for (%s, %s, %s) provided:", code, state, host, tokens);
          respond.success(tokens);
        })
        .catch(error => {
          logger.warn("Token for (%s, %s, %s) failed: %s", code, state, host, error.message || error)
          respond.error(error);
        });
    } else {
      const error = new Error('No code supplied');
      logger.error("Token for (%s, %s, %s) failed: %s", code, state, host, error.message || error);
      respond.error(error);
    }
  },
  jwks: () => {
    const jwks = openid.getJwks();
    logger.info("Providing access to JWKS:", jwks)
    respond.success(jwks);
  },
  openIdConfiguration: host => {
    const config = openid.getConfigFor(host);
    logger.info("Providing configuration for %s:", host, config);
    respond.success(config);
  }
});

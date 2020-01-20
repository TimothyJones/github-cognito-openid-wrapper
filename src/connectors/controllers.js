const qs = require('querystring');

const logger = require('./logger');
const openid = require('../openid');

const { COGNITO_REDIRECT_URI } = require('../config');

module.exports = respond => ({
  authorize: (client_id, scope, state, response_type, cognitoStates) =>
    cognitoStates
      .save(state)
      .then(stateId => {
        logger.info(`stateId: ${stateId}`);
        const authorizeUrl = openid.getAuthorizeUrl(
          client_id,
          scope,
          stateId,
          response_type
        );
        logger.info('Redirecting to authorizeUrl');
        logger.debug('Authorize Url is: %s', authorizeUrl, {});
        respond.redirect(authorizeUrl);
      })
  ,
  userinfo: tokenPromise => {
    tokenPromise
      .then(token => openid.getUserInfo(token))
      .then(userInfo => {
        logger.debug('Resolved user infos:', userInfo, {});
        respond.success(userInfo);
      })
      .catch(error => {
        logger.error(
          'Failed to provide user info: %s',
          error.message || error,
          {}
        );
        respond.error(error);
      });
  },
  token: (code, state, host) => {
    if (code) {
      openid
        .getTokens(code, state, host)
        .then(tokens => {
          logger.debug(
            'Token for (%s, %s, %s) provided',
            code,
            state,
            host,
            {}
          );
          respond.success(tokens);
        })
        .catch(error => {
          logger.error(
            'Token for (%s, %s, %s) failed: %s',
            code,
            state,
            host,
            error.message || error,
            {}
          );
          respond.error(error);
        });
    } else {
      const error = new Error('No code supplied');
      logger.error(
        'Token for (%s, %s, %s) failed: %s',
        code,
        state,
        host,
        error.message || error,
        {}
      );
      respond.error(error);
    }
  },
  jwks: () => {
    const jwks = openid.getJwks();
    logger.info('Providing access to JWKS: %j', jwks, {});
    respond.success(jwks);
  },
  openIdConfiguration: host => {
    const config = openid.getConfigFor(host);
    logger.info('Providing configuration for %s: %j', host, config, {});
    respond.success(config);
  },
  callback: (query, cognitoStates) => {
    cognitoStates
      .get(query.state)
      .then(cognitoState => {
        if (cognitoState) {
          logger.info(`Found cognito state: ${cognitoState}`);
          const queryString = qs.stringify({ ...query, state: cognitoState });
          const redirect = `${COGNITO_REDIRECT_URI}?${queryString}`;
          return respond.redirect(redirect);
        }
        logger.error(`Could not find cognito state for ${query.state}`);
        return respond.error(new Error('Could not authenticate'), 500);
      })
      .catch(err => {
        logger.error(err);
        return respond.error(err, 500);
      });
  }
});

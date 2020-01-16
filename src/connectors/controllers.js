const qs = require('querystring');
const openid = require('../openid');

const { COGNITO_REDIRECT_URI } = require('../config');

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
  token: (code, state, host, redirectUri) => {
    if (code) {
      openid
        .getTokens(code, state, host, redirectUri)
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
  },
  loginCallback: (query, cognitoStates) => {
    cognitoStates
      .get(query.state)
      .then(cognitoState => {
        if (cognitoState) {
          const queryString = qs.stringify({ ...query, state: cognitoState });
          const redirect = `${COGNITO_REDIRECT_URI}?${queryString}`;
          return respond.redirect(redirect);
        }
        console.error('Could not find cognito state for', query.state);
        return respond.error(new Error('Could not authenticate'), 500);
      })
      .catch(err => {
        console.error(err);
        return respond.error(err, 500);
      });
  },
  authorize: (query, cognitoStates) => {
    cognitoStates
      .save(query.state)
      .then(stateUuid => {
        const redirect = `https://github.com/login/oauth/authorize?client_id=${
          query.client_id
        }&scope=${query.scope}&state=${stateUuid}&response_type=${
          query.response_type
        }`;
        return respond.redirect(redirect);
      })
      .catch(err => {
        console.error(err);
        return respond.error(err, 500);
      });
  }
});

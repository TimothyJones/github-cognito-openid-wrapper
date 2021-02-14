const axios = require('axios');
const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  COGNITO_REDIRECT_URI,
  GITHUB_API_URL,
  GITHUB_LOGIN_URL
} = require('./config');
const logger = require('./connectors/logger');

const getApiEndpoints = (
  apiBaseUrl = GITHUB_API_URL,
  loginBaseUrl = GITHUB_LOGIN_URL
) => ({
  userDetails: `${apiBaseUrl}/user`,
  userEmails: `${apiBaseUrl}/user/emails`,
  oauthToken: `${loginBaseUrl}/login/oauth/access_token`,
  oauthAuthorize: `${loginBaseUrl}/login/oauth/authorize`
});

const debug_error = (err) => {
  if (err.response && err.response.data) {
    logger.error('Github response: %s', err.response.data, {})
    const custom_error = new Error(err.response.data || 'Unknown error');
    custom_error.status = err.response.status || 500;
    custom_error.description = err.response.data ? err.response.data.statusText : null;
    throw custom_error;
  }
  throw new Error(err);
}

axios.interceptors.response.use(r => r, debug_error);

const check = response => {
  logger.debug('Checking response: %j', response, {});

  if (response.data) {
    if (response.data.error) {
      throw new Error(
        `GitHub API responded with a failure: ${response.data.error}, ${
          response.data.error_description
        }`
      );
    } else if (response.status === 200) {
      return response.data;
    }
  }
  throw new Error(
    `GitHub API responded with a failure: ${response.status} (${
      response.statusText
    })`
  );
};

const gitHubGet = (url, accessToken) =>
  axios({
    method: 'get',
    url,
    headers: {
      Accept: 'application/vnd.github.v3+json',
      Authorization: `token ${accessToken}`
    }
  });

module.exports = (apiBaseUrl, loginBaseUrl) => {
  const urls = getApiEndpoints(apiBaseUrl, loginBaseUrl || apiBaseUrl);
  return {
    getAuthorizeUrl: (client_id, scope, state, response_type) =>
      `${urls.oauthAuthorize}?client_id=${client_id}&scope=${encodeURIComponent(
        scope
      )}&state=${state}&response_type=${response_type}`,
    getUserDetails: accessToken =>
      gitHubGet(urls.userDetails, accessToken).then(check),
    getUserEmails: (accessToken) => {
      logger.debug('Using access token: %s', accessToken, {})
      logger.debug('Fetching: %s', urls.userEmails, {})
      return gitHubGet(urls.userEmails, accessToken).then(check)
    },
    getToken: (code, state) => {
      const data = {
        // OAuth required fields
        grant_type: 'authorization_code',
        redirect_uri: COGNITO_REDIRECT_URI,
        client_id: GITHUB_CLIENT_ID,
        // GitHub Specific
        response_type: 'code',
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        // State may not be present, so we conditionally include it
        ...(state && { state })
      };

      logger.debug(
        'Getting token from %s with data: %j',
        urls.oauthToken,
        data,
        {}
      );
      return axios({
        method: 'post',
        url: urls.oauthToken,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        data
      }).then(check);
    }
  };
};

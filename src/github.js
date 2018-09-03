const axios = require('axios');
const util = require('util');
const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  COGNITO_REDIRECT_URI
} = require('./config');

const getApiEndpoints = (
  apiBaseUrl = 'https://api.github.com',
  loginBaseUrl = 'https://github.com'
) => ({
  userDetails: `${apiBaseUrl}/user`,
  userEmails: `${apiBaseUrl}/user/emails`,
  oauthToken: `${loginBaseUrl}/login/oauth/access_token`
});

const check = response => {
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
  console.log(util.inspect(response));
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
      Accept: 'application/json',
      Authorization: `token ${accessToken}`
    }
  });

module.exports = baseUrl => {
  const urls = getApiEndpoints(baseUrl, baseUrl);
  return {
    getUserDetails: accessToken =>
      gitHubGet(urls.userDetails, accessToken).then(check),
    getUserEmails: accessToken =>
      gitHubGet(urls.userEmails, accessToken).then(check),
    getToken: (code, state) =>
      axios({
        method: 'post',
        url: urls.oauthToken,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        data: {
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
        }
      }).then(check)
  };
};

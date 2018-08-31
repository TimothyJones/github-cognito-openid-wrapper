const axios = require('axios');
const util = require('util');
const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  COGNITO_REDIRECT_URI
} = require('./config');

const GITHUB_API_ROOT = 'https://api.github.com';
const GITHUB_API_USER_DETAILS = `${GITHUB_API_ROOT}/user`;
const GITHUB_API_USER_EMAILS = `${GITHUB_API_ROOT}/user/emails`;
const GITHUB_API_OAUTH_TOKEN = 'https://github.com/login/oauth/access_token';

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

module.exports = {
  getUserDetails: accessToken =>
    axios({
      method: 'get',
      url: GITHUB_API_USER_DETAILS,
      headers: {
        Accept: 'application/json',
        Authorization: `token ${accessToken}`
      }
    }).then(check),
  getUserEmails: accessToken =>
    axios({
      method: 'get',
      url: GITHUB_API_USER_EMAILS,
      headers: {
        Accept: 'application/json',
        Authorization: `token ${accessToken}`
      }
    }).then(check),
  getToken: (code, state) =>
    axios({
      method: 'post',
      url: GITHUB_API_OAUTH_TOKEN,
      headers: {
        Accept: 'application/json'
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

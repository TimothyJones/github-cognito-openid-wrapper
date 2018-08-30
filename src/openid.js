require('colors');
const axios = require('axios');
const util = require('util');
const fs = require('fs');
const { Base64 } = require('js-base64');
const JSONWebKey = require('json-web-key');
const jwt = require('jsonwebtoken');
const {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  REDIRECT_URI,
  KEY_ID,
  PRIVATE_RSA256_KEY
} = require('./config');

const cert = fs.readFileSync(`./${PRIVATE_RSA256_KEY}`);

const NumericDate = date => Math.floor(date / 1000);

const getPublicKey = () => ({
  alg: 'RS256',
  kid: KEY_ID,
  ...JSONWebKey.fromPEM(fs.readFileSync(`./${PRIVATE_RSA256_KEY}.pub`)).toJSON()
});

const getJwks = () => ({ keys: [getPublicKey()] });

const getUserInfo = accessToken =>
  Promise.all([
    axios({
      method: 'get',
      url: 'https://api.github.com/user',
      headers: {
        Accept: 'application/json',
        Authorization: `token ${accessToken}`
      }
    }).then(userResponse => {
      // Here we map the github user response to the standard claims from
      // OpenID. The mapping was constructed by following
      // https://developer.github.com/v3/users/
      // and http://openid.net/specs/openid-connect-core-1_0.html#StandardClaims
      const claims = {
        sub: `${userResponse.data.id}`, // OpenID requires a string
        name: userResponse.data.name,
        preferred_username: userResponse.data.login,
        profile: userResponse.data.html_url,
        picture: userResponse.data.avatar_url,
        website: userResponse.data.blog,
        updated_at: NumericDate(
          // OpenID requires the seconds since epoch in UTC
          new Date(Date.parse(userResponse.data.updated_at))
        )
      };
      console.info('User Claims: ', util.inspect(claims));
      return claims;
    }),

    axios({
      method: 'get',
      url: 'https://api.github.com/user/emails',
      headers: {
        Accept: 'application/json',
        Authorization: `token ${accessToken}`
      }
    }).then(emailsResponse => {
      const primaryEmail = emailsResponse.data.find(email => email.primary);
      return {
        email: primaryEmail.email,
        email_verified: primaryEmail.verified
      };
    })
  ]).then(claims => claims.reduce((acc, claim) => ({ ...acc, ...claim }), {}));

const getTokens = (code, state) =>
  axios({
    method: 'post',
    url: 'https://github.com/login/oauth/access_token',
    headers: {
      Accept: 'application/json'
    },
    data: {
      // OAuth required fields
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
      client_id: GITHUB_CLIENT_ID,
      // GitHub Specific
      response_type: 'code',
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      // State may not be present, so we conditionally include it
      ...(state && { state })
    }
  }).then(githubResponse => {
    if (githubResponse.data.error) {
      // Todo: return 400 error
      throw new Error(
        `GitHub token endpoint failed with ${githubResponse.data.error}, ${
          githubResponse.data.error_description
        }`
      );
    } else {
      console.log('GitHub Token:', util.inspect(githubResponse.data));
      // GitHub returns scopes separated by commas
      // But OAuth wants them to be spaces
      // https://tools.ietf.org/html/rfc6749#section-5.1
      // Also, we need to add openid as a scope,
      // since GitHub will have stripped it
      const scope = `openid ${githubResponse.data.scope.replace(',', ' ')}`;

      // ** JWT required fields **
      // iss - issuer https url
      // aud - audience that this token is valid for (GITHUB_CLIENT_ID)
      // sub - subject identifier - must be unique
      // ** Also required, but provided by jsonwebtoken **
      // exp - expiry time for the id token (seconds since epoch in UTC)
      // iat - time that the JWT was issued (seconds since epoch in UTC)

      return new Promise(resolve => {
        const payload = {
          //  ...userInfo,
          iss: `https://ddd9a2e0.ngrok.io`, // https://github.com/${GITHUB_CLIENT_ID}`,
          aud: GITHUB_CLIENT_ID
        };

        const idToken = jwt.sign(payload, cert, {
          expiresIn: '1h',
          algorithm: 'RS256',
          keyid: KEY_ID
        });

        console.log(
          'Token Header:',
          util.inspect(Base64.decode(idToken.split('.')[0]))
        );

        /*
        try {
          jwt.verify(id_token, jwkToPem(getPublicKey()));
          console.log('Token is valid'.cyan);
        } catch (error) {
          throw new Error(`Generated token did not validate: ${error.message}`);
        }
        */

        const tokenResponse = {
          ...githubResponse.data,
          scope,
          id_token: idToken
        };
        console.log(
          'Payload:',
          util.inspect(Base64.decode(tokenResponse.id_token.split('.')[1]))
        );
        console.log('Response:', util.inspect(tokenResponse));

        resolve(tokenResponse);
      });
    }
  });

const getConfigFor = host => ({
  issuer: `https://${host}`,
  authorization_endpoint: `https://${host}/authorize`,
  token_endpoint: `https://${host}/token`,
  token_endpoint_auth_methods_supported: [
    'client_secret_basic',
    'private_key_jwt'
  ],
  token_endpoint_auth_signing_alg_values_supported: ['RS256'],
  userinfo_endpoint: `https://${host}/userinfo`,
  // check_session_iframe: 'https://server.example.com/connect/check_session',
  // end_session_endpoint: 'https://server.example.com/connect/end_session',
  jwks_uri: `https://${host}/jwks.json`,
  // registration_endpoint: 'https://server.example.com/connect/register',
  scopes_supported: ['openid', 'read:user', 'user:email'],
  response_types_supported: [
    'code',
    'code id_token',
    'id_token',
    'token id_token'
  ],

  subject_types_supported: ['public'],
  userinfo_signing_alg_values_supported: ['none'],
  id_token_signing_alg_values_supported: ['RS256'],
  request_object_signing_alg_values_supported: ['none'],
  display_values_supported: ['page', 'popup'],
  claims_supported: [
    'sub',
    'name',
    'preferred_username',
    'profile',
    'picture',
    'website',
    'email',
    'email_verified',
    'updated_at',
    'iss',
    'aud'
  ]
});

module.exports = { getTokens, getUserInfo, getJwks, getConfigFor };

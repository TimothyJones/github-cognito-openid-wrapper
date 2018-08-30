const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const axios = require('axios');
const util = require('util');
const url = require('url');
const Base64 = require('js-base64').Base64;
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const {
  COGNITO_CLIENT_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  REDIRECT_URI
} = require('./config');

const hostname = '127.0.0.1';
const port = 3001;

const NumericDate = date => Math.floor(date / 1000);

const getUserInfo = accessToken =>
  axios({
    method: 'get',
    url: 'https://api.github.com/user',
    headers: {
      Accept: 'application/json',
      Authorization: `token ${accessToken}`
    }
  })
    .then(userResponse => {
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
      console.log('User Claims: ', util.inspect(claims));
      return claims;
    })
    .then(userClaims =>
      axios({
        method: 'get',
        url: 'https://api.github.com/user/emails',
        headers: {
          Accept: 'application/json',
          Authorization: `token ${accessToken}`
        }
      }).then(emailsResponse => {
        const primaryEmail = emailsResponse.data.find(email => email.primary);
        const claims = {
          ...userClaims,
          email: primaryEmail.email,
          email_verified: primaryEmail.email_verified
        };
        return claims;
      })
    );

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
      code: code,
      redirect_uri: REDIRECT_URI,
      client_id: GITHUB_CLIENT_ID,
      // GitHub Specific
      response_type: 'code',
      client_secret: GITHUB_CLIENT_SECRET,
      // State may not be present, so we conditionally include it
      ...(state && { state: state })
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

      return getUserInfo(githubResponse.data.access_token).then(userInfo => {
        const payload = {
          ...userInfo,
          iss: `https://github.com/${GITHUB_CLIENT_ID}`,
          aud: GITHUB_CLIENT_ID
        };

        const id_token = jwt.sign(payload, 'secret', {
          expiresIn: '1h'
        });

        const tokenResponse = {
          ...githubResponse.data,
          scope,
          id_token
        };
        console.log(
          'Payload:',
          util.inspect(Base64.decode(tokenResponse.id_token.split('.')[1]))
        );
        console.log('Response:', util.inspect(tokenResponse));

        return tokenResponse;
      });
    }
  });

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port);

const tokenEndpoint = (code, state, res) => {
  if (code) {
    getTokens(code, state)
      .then(tokens => {
        res.statusCode = 200;
        res.end(`Success with tokens: ${util.inspect(tokens)}`);
      })
      .catch(error => {
        res.statusCode = 400;
        res.end(`Failure: ${util.inspect(error.message)}`);
      });
  } else {
    res.statusCode = 400;
    res.end('No code supplied');
  }
};

const getBearerToken = req => {
  // This method implements https://tools.ietf.org/html/rfc6750
  const authHeader = req.get('Authorization');
  if (authHeader) {
    // Section 2.1 Authorization request header
    // Should be of the form 'Bearer <token>'
    // We can ignore the 'Bearer ' bit
    return authHeader.split(' ')[1];
  } else if (req.query.access_token) {
    // Section 2.3 URI query parameter
    return req.query.access_token;
  } else if (req.get('Content-Type') === 'application/x-www-form-urlencoded') {
    // Section 2.2 form encoded body parameter
    return req.body.access_token;
  }
  throw new Error('No token specified in request');
};

const userInfoEndpoint = (token, res) => {
  getUserInfo(token)
    .then(userInfo => {
      res.statusCode = 200;
      res.end(`Success with info: ${util.inspect(tokens)}`);
    })
    .catch(error => {
      res.statusCode = 400;
      res.end(`Failure: ${util.inspect(error.message)}`);
    });
};

app.get('/token', (req, res) => {
  tokenEndpoint(req.query.code, req.query.state, res);
});

app.post('/token', (req, res) => {
  tokenEndpoint(req.body.code, req.body.state, res);
});

app.get('/userinfo', (req, res) => {
  getUserInfo(getBearerToken(req));
});

app.post('/userinfo', (req, res) => {
  getUserInfo(getBearerToken(req));
});

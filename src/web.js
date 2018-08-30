const express = require('express');
const bodyParser = require('body-parser');
const util = require('util');
const { PORT } = require('./config');
const openid = require('./openid');
require('colors');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log('Request:'.cyan, req.method, util.inspect(req.url).magenta);
  console.log(' Headers:'.cyan, util.inspect(req.headers));
  console.log(' Body:'.cyan, util.inspect(req.body));
  console.log(' Query:'.cyan, util.inspect(req.query));
  next();
});
app.listen(PORT);

const marshalAndSend = (res, data) => {
  res.format({
    'application/json': () => {
      console.log('Responding Json:'.green, util.inspect(data));
      res.json(data);
    },
    default: () => {
      console.log(
        'Failed because client asked for bad format:'.red,
        util.inspect(data)
      );
      res.status(406).send('Not Acceptable');
    }
  });
};

const errorAndSend = (res, error) => {
  console.log('Responding Failure:'.red, util.inspect(error));
  res.statusCode = 400;
  res.end(`Failure: ${util.inspect(error.message)}`);
};

const tokenEndpoint = (code, state, res) => {
  if (code) {
    openid
      .getTokens(code, state)
      .then(tokens => {
        marshalAndSend(res, tokens);
      })
      .catch(error => {
        errorAndSend(res, error);
      });
  } else {
    errorAndSend(res, new Error('No code supplied'));
  }
};

const getBearerToken = req =>
  new Promise((resolve, reject) => {
    // This method implements https://tools.ietf.org/html/rfc6750
    const authHeader = req.get('Authorization');
    if (authHeader) {
      // Section 2.1 Authorization request header
      // Should be of the form 'Bearer <token>'
      // We can ignore the 'Bearer ' bit
      resolve(authHeader.split(' ')[1]);
    } else if (req.query.access_token) {
      // Section 2.3 URI query parameter
      resolve(req.query.access_token);
    } else if (
      req.get('Content-Type') === 'application/x-www-form-urlencoded'
    ) {
      // Section 2.2 form encoded body parameter
      resolve(req.body.access_token);
    }
    reject(new Error('No token specified in request'));
  });

const userInfoEndpoint = (req, res) => {
  getBearerToken(req)
    .then(token => openid.getUserInfo(token))
    .then(userInfo => {
      marshalAndSend(res, userInfo);
    })
    .catch(error => {
      errorAndSend(res, error);
    });
};

app.get('/jwks.json', (req, res) => res.json(openid.getJwks()));
app.get('/userinfo', userInfoEndpoint);
app.post('/userinfo', userInfoEndpoint);
app.get('/token', (req, res) => {
  tokenEndpoint(req.query.code, req.query.state, res);
});
app.post('/token', (req, res) => {
  tokenEndpoint(req.body.code, req.body.state, res);
});
app.get('/authorize', (req, res) =>
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${
      req.query.client_id
    }&scope=${req.query.scope}&state=${req.query.state}&response_type=${
      req.query.response_type
    }`
  )
);
app.post('/authorize', (req, res) =>
  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${
      req.query.client_id
    }&scope=${req.query.scope}&state=${req.query.state}&response_type=${
      req.query.response_type
    }`
  )
);
app.get('/.well-known/openid-configuration', (req, res) => {
  const host = req.get('host');
  const config = openid.getConfigFor(host);

  console.log('Responding: ', util.inspect(config));
  res.json(config);
});

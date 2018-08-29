const http = require('http');
const axios = require('axios');
const util = require('util');
const url = require('url');
const Base64 = require('js-base64').Base64;
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const {
  COGNITO_CLIENT_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET
} = require('./config');

const REDIRECT_URI = 'http://localhost:3001';
const hostname = '127.0.0.1';
const port = 3001;

const server = http.createServer(async (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  const { query, hash } = url.parse(req.url, true);
  console.log(req.url);
  if (query.code) {
    // https://github.com/login/oauth/authorize?client_id=b2b3695c786160b958bf&scope=read:user&redirect_uri=http://localhost:3001&state=baba
    axios({
      method: 'post',
      url: 'https://github.com/login/oauth/access_token',
      headers: {
        Accept: 'application/json'
      },
      data: {
        // OAuth required fields
        grant_type: 'authorization_code',
        code: query.code,
        redirect_uri: REDIRECT_URI,
        client_id: GITHUB_CLIENT_ID,
        // GitHub Specific
        state: query.state,
        response_type: 'code',
        client_secret: GITHUB_CLIENT_SECRET
      }
    })
      .then(response => {
        if (response.data.error) {
          res.end(
            // return 400 error
            `Code was ${query.code}: Failure with ${response.data.error}, ${
              response.data.error_description
            }`
          );
        } else {
          console.log(util.inspect(response.data));
          res.end(`Code was ${query.code}: Success`);
        }
      })
      .catch(error => {
        console.log(util.inspect(error.message));
        // return 400 error
        res.end(`Code was ${query.code}: Failure with ${error.message}`);
      });
  } else {
    res.end('Woo!');
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

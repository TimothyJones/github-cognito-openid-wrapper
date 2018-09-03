const JSONWebKey = require('json-web-key');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const { KEY_ID, PRIVATE_RSA256_KEY, GITHUB_CLIENT_ID } = require('./config');

const cert = fs.existsSync(PRIVATE_RSA256_KEY)
  ? fs.readFileSync(`${PRIVATE_RSA256_KEY}`)
  : undefined;
module.exports = {
  getPublicKey: () => ({
    alg: 'RS256',
    kid: KEY_ID,
    ...JSONWebKey.fromPEM(fs.readFileSync(`${PRIVATE_RSA256_KEY}.pub`)).toJSON()
  }),

  makeIdToken: (payload, host) =>
    jwt.sign(
      {
        ...payload,
        iss: `https://${host}`,
        aud: GITHUB_CLIENT_ID
      },
      cert,
      {
        expiresIn: '1h',
        algorithm: 'RS256',
        keyid: KEY_ID
      }
    )
};

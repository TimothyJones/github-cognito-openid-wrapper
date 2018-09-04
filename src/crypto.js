const JSONWebKey = require('json-web-key');
const jwt = require('jsonwebtoken');

const { GITHUB_CLIENT_ID } = require('./config');

const KEY_ID = 'jwtRS256';
const cert = require('../jwtRS256.key');
const pubKey = require('../jwtRS256.key.pub');

module.exports = {
  getPublicKey: () => ({
    alg: 'RS256',
    kid: KEY_ID,
    ...JSONWebKey.fromPEM(pubKey).toJSON()
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

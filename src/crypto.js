const fs = require('fs');
const path = require('path');
const JSONWebKey = require('json-web-key');
const jwt = require('jsonwebtoken');
const { GITHUB_CLIENT_ID } = require('./config');
const logger = require('./connectors/logger');

const KEY_ID = 'jwtRS256';

module.exports = {
  getPublicKey: () => {
    const pubKey = fs.readFileSync(path.join(__dirname, 'jwtRS256.key.pub'));
    return {
      alg: 'RS256',
      kid: KEY_ID,
      ...JSONWebKey.fromPEM(pubKey).toJSON()
    };
   },

  makeIdToken: (payload, host) => {
    const enrichedPayload = {
      ...payload,
      iss: `https://${host}`,
      aud: GITHUB_CLIENT_ID
    };
    logger.debug('Signing payload %j', enrichedPayload, {});
    const cert = fs.readFileSync(path.join(__dirname, 'jwtRS256.key'));
    return jwt.sign(enrichedPayload, cert, {
      expiresIn: '1h',
      algorithm: 'RS256',
      keyid: KEY_ID
    });
  }
};

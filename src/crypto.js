const JSONWebKey = require('json-web-key');
const jwt = require('jsonwebtoken');
const { GITHUB_CLIENT_ID, JWT_RSA_KEY, JWT_RSA_PUB } = require('./config');
const logger = require('./connectors/logger');

const KEY_ID = 'jwtRS256';
const cert = JWT_RSA_KEY
const pubKey = JWT_RSA_PUB

module.exports = {
  getPublicKey: () => ({
    alg: 'RS256',
    kid: KEY_ID,
    ...JSONWebKey.fromPEM(pubKey).toJSON()
  }),

  makeIdToken: (payload, host) => {
    const enrichedPayload = {
      ...payload,
      iss: `https://${host}`,
      aud: GITHUB_CLIENT_ID
    };
    logger.debug('Signing payload %j', enrichedPayload, {});
    return jwt.sign(enrichedPayload, cert, {
      expiresIn: '1h',
      algorithm: 'RS256',
      keyid: KEY_ID
    });
  }
};

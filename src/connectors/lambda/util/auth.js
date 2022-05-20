const logger = require('../../logger');

module.exports = {
  getBearerToken: (req) =>
    new Promise((resolve, reject) => {
      // This method implements https://tools.ietf.org/html/rfc6750
      const authHeader = req.headers.Authorization;
      logger.debug('Detected authorization header %s', authHeader);
      if (authHeader) {
        // Section 2.1 Authorization request header
        // Should be of the form 'Bearer <token>'
        // We can ignore the 'Bearer ' bit
        const authValue = authHeader.split(' ')[1];
        logger.debug('Section 2.1 Authorization bearer header: %s', authValue);
        resolve(authValue);
      } else if (req.queryStringParameters.access_token) {
        // Section 2.3 URI query parameter
        const accessToken = req.queryStringParameters.access_token;
        logger.debug(
          'Section 2.3 Authorization query parameter: %s',
          accessToken
        );
        resolve(req.queryStringParameters.access_token);
      } else if (
        req.headers['Content-Type'] === 'application/x-www-form-urlencoded' &&
        req.body
      ) {
        // Section 2.2 form encoded body parameter
        const body = JSON.parse(req.body);
        logger.debug('Section 2.2. Authorization form encoded body: %s', body);
        resolve(body.access_token);
      } else {
        const msg = 'No token specified in request';
        logger.warn(msg);
        reject(new Error(msg));
      }
    }),

  getIssuer: (host, stage) => {
    const lStage = stage;
    const issuer = `${host}/${lStage}`;
    return issuer;
  },
};

module.exports = {
  getBearerToken: req =>
    new Promise((resolve, reject) => {
      // This method implements https://tools.ietf.org/html/rfc6750
      const authHeader = req.headers.Authorization;
      if (authHeader) {
        // Section 2.1 Authorization request header
        // Should be of the form 'Bearer <token>'
        // We can ignore the 'Bearer ' bit
        resolve(authHeader.split(' ')[1]);
      } else if (req.queryStringParameters.access_token) {
        // Section 2.3 URI query parameter
        resolve(req.queryStringParameters.access_token);
      } else if (
        req.headers['Content-Type'] === 'application/x-www-form-urlencoded' &&
        req.body
      ) {
        // Section 2.2 form encoded body parameter
        const body = JSON.parse(req.body);
        resolve(body.access_token);
      }
      reject(new Error('No token specified in request'));
    }),

  getIssuer: (host, stage) => {
    const lStage = stage || 'Prod';
    const issuer = `${host}/${lStage}`;
    return issuer;
  }
};

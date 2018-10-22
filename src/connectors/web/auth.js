module.exports = {
  getBearerToken: req =>
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
    }),

  getIssuer: host => `${host}`
};

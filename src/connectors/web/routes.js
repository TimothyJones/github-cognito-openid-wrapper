const handlers = require('./handlers');

module.exports = app => {
  app.get('/userinfo', handlers.userinfo);
  app.post('/userinfo', handlers.userinfo);
  app.get('/token', handlers.token);
  app.post('/token', handlers.token);
  app.get('/authorize', handlers.authorize);
  app.post('/authorize', handlers.authorize);
  app.get('/jwks.json', handlers.jwks);
  app.get('/.well-known/openid-configuration', handlers.openIdConfiguration);
};

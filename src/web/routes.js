const controllers = require('./controllers');

module.exports = app => {
  app.get('/userinfo', controllers.userInfo);
  app.post('/userinfo', controllers.userInfo);
  app.get('/token', controllers.token);
  app.post('/token', controllers.token);
  app.get('/authorize', controllers.authorize);
  app.post('/authorize', controllers.authorize);
  app.get('/jwks.json', controllers.jwks);
  app.get('/.well-known/openid-configuration', controllers.openIdConfiguration);
};

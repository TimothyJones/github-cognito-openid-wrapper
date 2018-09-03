const express = require('express');
const bodyParser = require('body-parser');
const util = require('util');
const routes = require('./routes');
const { PORT } = require('../config');
const validateConfig = require('../validate-config');

require('colors');

const app = express();

try {
  validateConfig();
} catch (e) {
  console.error('Failed to start:'.red, e.message);
  console.error('  See the readme for configuration information');
  process.exit(1);
}
console.log('Config is valid'.cyan);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
  console.log('Request:'.cyan, req.method, util.inspect(req.url).magenta);
  console.log(' Headers:'.cyan, util.inspect(req.headers));
  console.log(' Body:'.cyan, util.inspect(req.body));
  console.log(' Query:'.cyan, util.inspect(req.query));
  next();
});
routes(app);
app.listen(PORT);
console.log(`Listening on ${PORT}`.cyan);

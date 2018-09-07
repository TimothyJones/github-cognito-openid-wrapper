const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const { PORT } = require('../../config');
const validateConfig = require('../../validate-config');

require('colors');

const app = express();

try {
  validateConfig();
} catch (e) {
  console.error('Failed to start:'.red, e.message);
  console.error('  See the readme for configuration information');
  process.exit(1);
}
console.info('Config is valid'.cyan);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
routes(app);
app.listen(PORT);
console.info(`Listening on ${PORT}`.cyan);

const path = require('path');
const { Pact } = require('@pact-foundation/pact');
const pkg = require('../package.json');

global.port = 8989;
global.PACT_BASE_URL = `http://localhost:${port}`;

global.provider = new Pact({
  port: global.port,
  log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  spec: 2,
  logLevel: 'fatal',
  pactfileWriteMode: 'update',
  consumer: pkg.name,
  provider: 'GitHub.com'
});

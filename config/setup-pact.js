const path = require('path');
const { Pact } = require('@pact-foundation/pact');
const pkg = require('../package.json');

global.port = 8989;
global.PACT_BASE_URL = `http://127.0.0.1:${port}`;

global.provider = new Pact({
  port: global.port,
  log: path.resolve(process.cwd(), 'logs', 'mockserver-integration.log'),
  dir: path.resolve(process.cwd(), 'pacts'),
  spec: 2,
  logLevel: 'debug',
  pactfileWriteMode: 'update',
  consumer: pkg.name,
  provider: 'GitHub.com',
});

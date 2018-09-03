const config = require('./config');
const fs = require('fs');

const ensureString = variableName => {
  if (typeof config[variableName] !== 'string') {
    throw new Error(
      `Environment variable ${variableName} must be set and be a string`
    );
  }
};

const ensureNumber = variableName => {
  if (typeof config[variableName] !== 'number') {
    throw new Error(
      `Environment variable ${variableName} must be set and be a number`
    );
  }
};

const requiredStrings = [
  'GITHUB_CLIENT_ID',
  'GITHUB_CLIENT_SECRET',
  'COGNITO_REDIRECT_URI',
  'KEY_ID',
  'PRIVATE_RSA256_KEY'
];

const requiredNumbers = ['PORT'];

module.exports = () => {
  requiredStrings.forEach(ensureString);
  requiredNumbers.forEach(ensureNumber);
  if (!fs.existsSync(config.PRIVATE_RSA256_KEY)) {
    throw new Error(
      `Private key file ${config.PRIVATE_RSA256_KEY} does not exist`
    );
  }
  if (!fs.existsSync(`${config.PRIVATE_RSA256_KEY}.pub`)) {
    throw new Error(
      `Public key file ${config.PRIVATE_RSA256_KEY}.pub does not exist`
    );
  }
};

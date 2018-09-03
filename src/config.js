const port = (module.exports = {
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  COGNITO_REDIRECT_URI: process.env.COGNITO_REDIRECT_URI,
  KEY_ID: process.env.KEY_ID,
  PRIVATE_RSA256_KEY: process.env.PRIVATE_RSA256_KEY,
  PORT: parseInt(process.env.PORT, 10) || undefined
});

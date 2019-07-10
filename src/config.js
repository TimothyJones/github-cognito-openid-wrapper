module.exports = {
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  COGNITO_REDIRECT_URI: process.env.COGNITO_REDIRECT_URI,
  GITHUB_API_URL: process.env.GITHUB_API_URL,
  GITHUB_LOGIN_URL: process.env.GITHUB_LOGIN_URL,
  PORT: parseInt(process.env.PORT, 10) || undefined
};

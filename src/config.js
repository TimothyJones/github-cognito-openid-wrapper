module.exports = {
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  COGNITO_REDIRECT_URI: process.env.COGNITO_REDIRECT_URI,
  SHIM_REDIRECT_URI: process.env.SHIM_REDIRECT_URI,
  STATE_DYNAMODB_TABLE:
    process.env.STATE_DYNAMODB_TABLE || 'CognitoStateStore',
  DYNAMODB_ENDPOINT: process.env.DYNAMODB_ENDPOINT || undefined,
  PORT: parseInt(process.env.PORT, 10) || undefined,
  STATIC_SECURITY_HEADERS: {
    'Cache-Control': 'no-cache, no-store, max-age=0, must-revalidate',
    Pragma: 'no-cache',
    Expires: 'Thu, 01 Jan 1970 00:00:00 UTC',
    'X-Content-Type-Options': 'nosniff',
    'X-Xss-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000 ; includeSubDomains',
    'X-Frame-Options': 'DENY'
  }
};

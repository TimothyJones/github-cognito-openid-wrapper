#!/bin/bash -eu

export GITHUB_CLIENT_ID=<GitHub Client ID>
export GITHUB_CLIENT_SECRET=<GitHub Client Secret>
export COGNITO_REDIRECT_URI=https://<Your Cognito Domain>/oauth2/idpresponse
export KEY_ID=<Any Random String to identify the private key>
export PRIVATE_RSA256_KEY=<Path to your private key file>
export PORT=<Port to start the server on>

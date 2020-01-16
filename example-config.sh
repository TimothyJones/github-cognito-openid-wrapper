#!/bin/bash -eu

# Variables always required
export GITHUB_CLIENT_ID=# <GitHub OAuth App Client ID>
export GITHUB_CLIENT_SECRET=# <GitHub OAuth App Client Secret>
export COGNITO_REDIRECT_URI=# https://<Your Cognito Domain>/oauth2/idpresponse
export SHIM_REDIRECT_URI=# https://<Your shim domain>/callback
export STATE_DYNAMODB_TABLE=CognitoStateStore

# Variables required if deploying with API Gateway / Lambda
export BUCKET_NAME=# An S3 bucket name to use as the deployment pipeline
export STACK_NAME=# The name of the stack to create
export REGION=# AWS region to deploy the stack and bucket in

# Variables required if deploying a node http server
export PORT=# <Port to start the server on>

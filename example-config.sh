#!/bin/bash -eu

# Variables always required
export GITHUB_CLIENT_ID=# <GitHub OAuth App Client ID>
export GITHUB_CLIENT_SECRET=# <GitHub OAuth App Client Secret>
export COGNITO_REDIRECT_URI=# https://<Your Cognito Domain>/oauth2/idpresponse
# Change these if used with GitHub Enterprise (see below)
export GITHUB_API_URL=https://api.github.com
export GITHUB_LOGIN_URL=https://github.com

# Alternate URLs if used with GitHub Enterprise
# GITHUB_API_URL=# https://<GitHub Enterprise Host>/api/v3
# GITHUB_LOGIN_URL=# https://<GitHub Enterprise Host>

# Variables required if Splunk logger is used
# SPLUNK_URL=# https://<Splunk HEC>/services/collector/event/1.0
# SPLUNK_TOKEN=# Splunk HTTP Event Collector token
# SPLUNK_SOURCE=# Source for all logged events
# SPLUNK_SOURCETYPE=# Sourcetype for all logged events
# SPLUNK_INDEX=# Index for all logged events

# Variables required if deploying with API Gateway / Lambda
export BUCKET_NAME=# An S3 bucket name to use as the deployment pipeline
export STACK_NAME=# The name of the stack to create
export REGION=# AWS region to deploy the stack and bucket in
export STAGE_NAME=# Stage name to create and deploy to in API gateway

# Variables required if deploying a node http server
export PORT=# <Port to start the server on>

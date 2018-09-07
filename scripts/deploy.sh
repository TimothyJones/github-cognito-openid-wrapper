#!/bin/bash -eu
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"; pwd)"  # Figure out where the script is running
. "$SCRIPT_DIR"/lib-robust-bash.sh # load the robust bash library
PROJECT_ROOT="$SCRIPT_DIR"/.. # Figure out where the project directory is

# Ensure dependencies are present

require_binary aws
require_binary sam

# Ensure configuration is present

if [ ! -f "$PROJECT_ROOT/config.sh" ]; then
  echo "ERROR: config.sh is missing. Copy example-config.sh and modify as appropriate."
  echo "   cp example-config.sh config.sh"
  exit 1
fi
source ./config.sh


OUTPUT_TEMPLATE_FILE="$PROJECT_ROOT/serverless-output.yml"
aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
sam package --template-file template.yml --output-template-file "$OUTPUT_TEMPLATE_FILE"  --s3-bucket "$BUCKET_NAME"
sam deploy --region "$REGION" --template-file "$OUTPUT_TEMPLATE_FILE" --stack-name "$STACK_NAME" --parameter-overrides GitHubClientIdParameter="$GITHUB_CLIENT_ID" GitHubClientSecretParameter="$GITHUB_CLIENT_SECRET" CognitoRedirectUriParameter="$COGNITO_REDIRECT_URI" --capabilities CAPABILITY_IAM

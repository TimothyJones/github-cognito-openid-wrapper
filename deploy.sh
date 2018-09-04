#!/bin/bash -eu
source ./set-env.sh

BUCKET_NAME=timjones-pact-broker-github-auth-spike
STACK_NAME=TimJones-pact-broker-github-auth-spike
OUTPUT_TEMPLATE_FILE=serverless-output.yml
REGION=us-east-1


aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
sam package --template-file sam.yml --output-template-file "$OUTPUT_TEMPLATE_FILE"  --s3-bucket "$BUCKET_NAME"
sam deploy --region "$REGION" --template-file "$OUTPUT_TEMPLATE_FILE" --stack-name "$STACK_NAME" --parameter-overrides GitHubClientIdParameter="$GITHUB_CLIENT_ID" GitHubClientSecretParameter="$GITHUB_CLIENT_SECRET" CognitoRedirectUriParameter="$COGNITO_REDIRECT_URI" --capabilities CAPABILITY_IAM

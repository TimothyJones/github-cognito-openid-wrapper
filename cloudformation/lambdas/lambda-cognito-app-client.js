/**
 This lambda will only run when one of the properties passed into it has changed.
 If you have updated the code and want the lambda to run,
 then modify the `ChangeThisToForceAppClientConfigureToRun` property.
*/

const AWS = require('aws-sdk');
const customResource = require('./customResource');

const client = ({ ResourceProperties: cfg }) => ({
  CallbackURLs: [cfg.LoginCallback],
  AllowedOAuthScopes: ['email', 'openid', 'profile'],
  UserPoolId: cfg.UserPoolId,
  AllowedOAuthFlowsUserPoolClient: true,
  ClientId: cfg.ClientId,
  AllowedOAuthFlows: ['code'],
  LogoutURLs: [cfg.LogoutCallback],
  WriteAttributes: [
    'address',
    'birthdate',
    'email',
    'family_name',
    'gender',
    'given_name',
    'locale',
    'middle_name',
    'name',
    'nickname',
    'phone_number',
    'picture',
    'preferred_username',
    'profile',
    'updated_at',
    'website',
    'zoneinfo'
  ],
  SupportedIdentityProviders: ['COGNITO', cfg.Idp],
  ReadAttributes: [
    'custom:github_organizations',
    'custom:tenant_ids',
    'address',
    'birthdate',
    'email',
    'email_verified',
    'family_name',
    'gender',
    'given_name',
    'locale',
    'middle_name',
    'name',
    'nickname',
    'phone_number',
    'phone_number_verified',
    'picture',
    'preferred_username',
    'profile',
    'updated_at',
    'website',
    'zoneinfo'
  ]
});

const cisp = new AWS.CognitoIdentityServiceProvider();
module.exports.handler = customResource({
  physicalResourceId: event =>
    `${event.ResourceProperties.UserPoolId}-${
      event.ResourceProperties.ClientId
    }`,
  Delete: (event, responder) => {
    responder.success({});
  },
  Update: (event, responder) => {
    cisp.updateUserPoolClient(client(event), responder.callback);
  },
  Create: (event, responder) => {
    cisp.updateUserPoolClient(client(event), responder.callback);
  }
});

/**
 This lambda will only run when one of the properties passed into it has changed.
 If you have updated the code and want the lambda to run,
 then modify the `ChangeThisToForceIdpConfigureToRun` property.
*/

const AWS = require('aws-sdk');
const customResource = require('./customResource');

const idp = event => ({
  UserPoolId: event.ResourceProperties.UserPoolId,
  ProviderDetails: {
    attributes_request_method: 'GET',
    jwks_uri: `${event.ResourceProperties.Issuer}/jwks.json`,
    client_id: `${event.ResourceProperties.ClientId}`,
    authorize_url: `${event.ResourceProperties.Issuer}/authorize`,
    token_url: `${event.ResourceProperties.Issuer}/token`,
    oidc_issuer: `${event.ResourceProperties.Issuer}`,
    attributes_url_add_attributes: 'false',
    attributes_url: `${event.ResourceProperties.Issuer}/userinfo`,
    authorize_scopes: 'openid read:user user:email read:org'
  },
  ProviderName: `${event.ResourceProperties.ProviderName}`,
  AttributeMapping: {
    profile: 'profile',
    picture: 'picture',
    name: 'name',
    'custom:github_organizations': 'organizations',
    email_verified: 'email_verified',
    username: 'sub',
    updated_at: 'updated_at',
    website: 'website',
    email: 'email'
  },
  IdpIdentifiers: []
});

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

const deleteIdP = ({ UserPoolId, ProviderName }, cb) => {
  cognitoidentityserviceprovider.deleteIdentityProvider(
    {
      UserPoolId,
      ProviderName
    },
    cb
  );
};

module.exports.handler = customResource({
  physicalResourceId: event =>
    `${event.ResourceProperties.Issuer}-${
      event.ResourceProperties.ProviderName
    }`,
  Create: (event, responder) => {
    cognitoidentityserviceprovider.createIdentityProvider(
      { ...idp(event), ProviderType: 'OIDC' },
      responder.callback
    );
  },
  Delete: (event, responder) => {
    deleteIdP(event.ResourceProperties, (err, data) => {
      if (err && err.name !== 'ResourceNotFoundException') {
        responder.error(err.message, err.stack);
        return;
      }
      responder.success(data);
    });
  },
  Update: (event, responder) => {
    deleteIdP(event.OldResourceProperties, err => {
      if (err && err.name !== 'ResourceNotFoundException') {
        responder.error(err.message, err.stack);
        return;
      }
      cognitoidentityserviceprovider.createIdentityProvider(
        { ...idp(event), ProviderType: 'OIDC' },
        responder.callback
      );
    });
  }
});

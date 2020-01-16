/**
 This lambda will only run when one of the properties passed into it has changed.
 If you have updated the code and want the lambda to run,
 then modify the `ChangeThisToForceCallCreateDomainToRun` property.
*/

const AWS = require('aws-sdk');
const customResource = require('./customResource');

const domain = ({ ResourceProperties: cfg }) => ({
  Domain: cfg.Domain,
  UserPoolId: cfg.UserPoolId
});

const cisp = new AWS.CognitoIdentityServiceProvider();

module.exports.handler = customResource({
  physicalResourceId: event =>
    `${event.ResourceProperties.UserPoolId}-${event.ResourceProperties.Domain}`,
  Create: (event, responder) => {
    cisp.createUserPoolDomain(domain(event), responder.callback);
  },
  Delete: (event, responder) => {
    cisp.deleteUserPoolDomain(domain(event), responder.callback);
  },
  Update: (event, responder) => {
    cisp.deleteUserPoolDomain(
      domain({ ResourceProperties: event.OldResourceProperties }),
      err => {
        if (err) {
          console.log(err, err.stack); // an error occurred
          responder.error(err.message);
        } else {
          cisp.createUserPoolDomain(domain(event), responder.callback);
        }
      }
    );
  }
});

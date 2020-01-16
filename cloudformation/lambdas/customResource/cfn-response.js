/* Imported from https://github.com/LukeMizuhashi/cfn-response/blob/master/index.js ,
  because AWS doesn't include it by default unless you use ZipFile in cloudformation 
  
  Then heavily modified to improve the logging output and change the API
  */
const https = require('https');
const url = require('url');

const SUCCESS = 'SUCCESS';
const FAILED = 'FAILED';

const printError = data => (data && data.Error ? `${data.Error}` : '');

const send = (
  { event, context, responseStatus, physicalResourceId, noEcho },
  responseData
) => {
  if (responseData && responseData.Error) {
    console.log('Error:\n', responseData);
  }

  const responseBody = JSON.stringify({
    Status: responseStatus,
    Reason: `${printError(
      responseData
    )} -- See the details in Cloud Watch Log stream: ${
      context.logStreamName
    } in Log Group ${context.logGroupName}`,
    PhysicalResourceId: physicalResourceId,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    NoEcho: noEcho,
    Data: responseData
  });

  console.log('Contacting cloudformation with: :\n', responseBody);

  const parsedUrl = url.parse(event.ResponseURL);
  const request = https.request(
    {
      hostname: parsedUrl.hostname,
      port: 443,
      path: parsedUrl.path,
      method: 'PUT',
      headers: {
        'content-type': '',
        'content-length': responseBody.length
      }
    },
    response => {
      console.log(
        `Cloudformation replied: ${response.statusCode} ${
          response.statusMessage
        }`
      );
      context.done();
    }
  );

  request.on('error', error => {
    console.log(
      `Contacting Cloudformation failed executing https.request(..): ${error}`
    );
    context.done();
  });

  request.write(responseBody);
  request.end();
};

module.exports.success = (options, data) =>
  send({ ...options, responseStatus: SUCCESS }, data);

module.exports.failed = (options, data) =>
  send({ ...options, responseStatus: FAILED }, data);

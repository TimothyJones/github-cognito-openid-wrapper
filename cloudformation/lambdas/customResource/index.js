const sendResponse = require('./cfn-response');

module.exports = ({
  Delete,
  Update,
  Create,
  physicalResourceId,
  noEcho = false
}) => (event, context) => {
  const options = {
    event,
    context,
    physicalResourceId:
      (physicalResourceId instanceof Function
        ? physicalResourceId(event, context)
        : physicalResourceId) || context.logStreamName,
    noEcho
  };

  const responder = {
    error: (message, info) =>
      sendResponse.failed(options, { Error: message, info }),
    success: data => sendResponse.success(options, data),
    callback: (err, data) => {
      if (err) {
        console.log(err, err.stack); // an error occurred
        responder.error(err.message);
        return;
      }
      responder.success(data);
    }
  };

  try {
    console.log('Cloudformation event:\n', JSON.stringify(event));
    switch (event.RequestType) {
      case 'Delete':
        Delete(event, responder, context);
        return;
      case 'Update':
        Update(event, responder, context);
        return;
      case 'Create':
        Create(event, responder, context);
        return;
      default:
        responder.error(`Unhandled RequestType: ${event.RequestType}`);
    }
  } catch (e) {
    responder.error(e.message);
  }
};

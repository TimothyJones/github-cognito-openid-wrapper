const responder = require('./responder');

module.exports = handler => (event, context, callback) => {
  if (event.source === 'aws.events') {
    responder(callback).success({
      message: 'awake'
    });
  } else {
    handler(event, context, callback);
  }
};

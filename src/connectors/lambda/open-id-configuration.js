const responder = require('./util/responder');
const auth = require('./util/auth');
const controllers = require('../controllers');

module.exports.handler = (event, context, callback) => {
  if ( event.requestContext.stage === 'dev' && process.env.SLS_DEBUG ) {
    console.info( `Event: ${ JSON.stringify( event, null, 2 ) }` );
  }

  controllers(responder(callback)).openIdConfiguration(
    auth.getIssuer(event.headers.Host, event.requestContext)
  );
};

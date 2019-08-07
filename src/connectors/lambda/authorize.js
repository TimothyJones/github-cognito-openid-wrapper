const util = require( 'util' );
const responder = require('./util/responder');
const controllers = require('../controllers');

module.exports.handler = (event, context, callback) => {

  if ( process.env.SLS_DEBUG ) {
    console.info( `Event: ${ JSON.stringify( event, null, 2 ) }` );
  }

  const {
    client_id,
    scope,
    state,
    response_type
  } = event.queryStringParameters;

  const authorizeParameters = { 
    client_id,
    scope,
    state,
    response_type
  };

  if ( process.env.SLS_DEBUG ) {
    console.info( `INFO: ${ util.inspect( authorizeParameters ) }` );
  }

  controllers(responder(callback)).authorize(
    client_id,
    scope,
    state,
    response_type);
};

const util = require( 'util' );

module.exports = callback => ({
  success: response => {
    if ( process.env.SLS_DEBUG ) {
      console.info( `INFO: ${ util.inspect( response ) }` );
    }

    callback(null, {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  error: err => {
    if ( process.env.SLS_DEBUG ) {
      console.error( `ERROR: ${ util.inspect( err ) }` );
    }

    callback(null, {
      statusCode: 400,
      body: JSON.stringify(err.message),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  redirect: url => {
    const redirectObject = {
      statusCode: 302,
      headers: {
        Location: url
      }
    };

    if ( process.env.SLS_DEBUG ) {
      console.info( `INFO: ${ util.inspect( redirectObject ) }` );
    }

    callback(null, redirectObject);
  }
});

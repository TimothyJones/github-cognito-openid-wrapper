module.exports = callback => ({
  success: response =>
    callback(null, {
      statusCode: 200,
      body: JSON.stringify(response),
      headers: {
        'Content-Type': 'application/json'
      }
    }),
  error: err =>
    callback(null, {
      statusCode: 400,
      body: JSON.stringify(err.message),
      headers: {
        'Content-Type': 'application/json'
      }
    }),
  redirect: url => {
    callback(null, {
      statusCode: 302,
      headers: {
        Location: url
      }
    });
  }
});

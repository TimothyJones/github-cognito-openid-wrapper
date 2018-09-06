module.exports = callback => ({
  success: response =>
    callback(null, {
      statusCode: '200',
      body: JSON.stringify(response),
      headers: {
        'Content-Type': 'application/json'
      }
    }),
  error: err =>
    callback(null, {
      statusCode: '400',
      body: JSON.stringify(err.message),
      headers: {
        'Content-Type': 'application/json'
      }
    }),
  redirect: url => {
    const response = {
      statusCode: 302,
      headers: {
        Location: url
      }
    };
    console.log(response);
    callback(null, response);
  }
});

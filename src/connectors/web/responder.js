const util = require('util');

require('colors');

module.exports = res => ({
  success: data => {
    res.format({
      'application/json': () => {
        res.json(data);
      },
      default: () => {
        res.status(406).send('Not Acceptable');
      }
    });
  },
  error: error => {
    res.statusCode = 400;
    res.end(`Failure: ${util.inspect(error.message)}`);
  },
  redirect: url => res.redirect(url)
});

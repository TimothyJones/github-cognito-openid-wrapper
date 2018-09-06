const util = require('util');

require('colors');

module.exports = {
  success: (res, data) => {
    res.format({
      'application/json': () => {
        console.log('Responding Json:'.green, util.inspect(data));
        res.json(data);
      },
      default: () => {
        console.log(
          'Failed because client asked for bad format:'.red,
          util.inspect(data)
        );
        res.status(406).send('Not Acceptable');
      }
    });
  },
  error: (res, error) => {
    console.log('Responding Failure:'.red, util.inspect(error));
    res.statusCode = 400;
    res.end(`Failure: ${util.inspect(error.message)}`);
  }
};

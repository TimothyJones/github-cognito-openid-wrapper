const slsw = require( 'serverless-webpack' );
const path = require( 'path' );

module.exports = {
  entry: slsw.lib.entries,
  externals: [ 'aws-sdk' ],
  target: 'node',
  mode: 'development',
  module: {
    rules: [ {
      test: /\.js$/,
      loaders: [ 'babel-loader' ],
      // include: __dirname,
      // exclude: /node_modules/,
    },
    {
      test: /\.(key|key.pub)$/,
      use: [
        {
          loader: 'raw-loader'
        }
      ]
    },
   ],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join( __dirname, '.webpack' ),
    filename: '[name].js', // this should match the first part of function handler in `serverless.yml`
  },
};

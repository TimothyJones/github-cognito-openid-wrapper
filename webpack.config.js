const NodemonPlugin = require('nodemon-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');

const baseConfig = {
  mode: 'development',
  target: 'node',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};

const config = [
  {
    ...baseConfig,
    output: {
      libraryTarget: 'commonjs2',
      path: `${__dirname}/dist-lambda`,
      filename: '[name].js'
    },
    entry: {
      openIdConfiguration: './src/connectors/lambda/open-id-configuration.js',
      token: './src/connectors/lambda/token.js',
      userinfo: './src/connectors/lambda/userinfo.js',
      jwks: './src/connectors/lambda/jwks.js',
      authorize: './src/connectors/lambda/authorize.js'
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'jwtRS256.key', to: `${__dirname}/dist-lambda/jwtRS256.key` },
          { from: 'jwtRS256.key.pub', to: `${__dirname}/dist-lambda/jwtRS256.key.pub` }
        ],
      }),
    ]
  },
  {
    ...baseConfig,
    output: {
      libraryTarget: 'commonjs2',
      path: `${__dirname}/dist-web`,
      filename: '[name].js'
    },
    entry: {
      server: './src/connectors/web/app.js'
    },
    externals: [nodeExternals()],
    plugins: [
      new NodemonPlugin(),
      new CopyPlugin({
        patterns: [
          { from: 'jwtRS256.key', to: `${__dirname}/dist-web/jwtRS256.key` },
          { from: 'jwtRS256.key.pub', to: `${__dirname}/dist-web/jwtRS256.key.pub` }
        ],
      }),
    ]
  }
];

module.exports = config;

const config = {
  mode: 'development',
  target: 'node',
  entry: {
    openIdConfiguration: './src/lambda/open-id-configuration.js',
    token: './src/lambda/token.js',
    userinfo: './src/lambda/userinfo.js',
    jwks: './src/lambda/jwks.js',
    authorize: './src/lambda/authorize.js'
  },
  output: {
    libraryTarget: 'commonjs2',
    path: `${__dirname}/dist`,
    filename: '[name].js'
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.(key|key.pub)$/,
        use: [
          {
            loader: 'raw-loader',
          }
        ]
      }
    ]
  }
};

module.exports = config;

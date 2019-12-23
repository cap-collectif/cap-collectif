const path = require('path');
const webpack = require('webpack');

const devBuild = process.env.NODE_ENV !== 'production';
const nodeEnv = devBuild ? 'development' : 'production';

module.exports = {
  mode: nodeEnv,
  context: __dirname,
  entry: ['babel-polyfill', '../frontend/js-server/registration.js'],
  output: {
    path: path.resolve(__dirname, '../web/js'),
    filename: 'server-bundle.js',
  },
  resolve: {
    extensions: ['.js'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(nodeEnv),
      },
      __SERVER__: true,
    }),
    new webpack.ProvidePlugin({
      fetch: 'imports-loader?this=>global!exports-loader?global.fetch!whatwg-fetch',
    }),
    new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /en|fr/),
  ],
  module: {
    rules: [
      {
        test: /\.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: { cacheDirectory: devBuild },
      },
      { test: /LeafletMap.js$/, loader: 'ignore-loader' },
    ],
    // Shut off warnings about using pre-built javascript files
    // as Quill.js unfortunately ships one as its `main`.
    noParse: /node_modules\/quill\/dist/,
  },
};

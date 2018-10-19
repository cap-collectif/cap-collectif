const webpack = require('webpack');
const merge = require('webpack-merge');

const webpackClient = require('./webpack.client.js');

const watchConf = merge.smart(
  {
    devtool: 'eval-source-map',
    plugins: [
      new webpack.DefinePlugin({
        USE_HOT_ASSETS: true,
      }),
    ],
    watch: true,
    watchOptions: {
      poll: 1000,
    },
  },
  webpackClient,
);

module.exports = watchConf;

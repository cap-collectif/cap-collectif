const webpack = require('webpack');
const merge = require('webpack-merge');
const path = require('path');

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
      ignored: [path.resolve('web/fonts')],
    },
  },
  webpackClient,
);

module.exports = watchConf;

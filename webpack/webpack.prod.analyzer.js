/* eslint-disable sorting/sort-object-props */
/* eslint-disable flowtype/require-valid-file-annotation */

const merge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const webpackClient = require('./webpack.prod.client.js');

module.exports = merge.smart(webpackClient, {
  plugins: [new BundleAnalyzerPlugin()],
});

/* eslint-disable sorting/sort-object-props */
/* eslint-disable flowtype/require-valid-file-annotation */

const webpack = require('webpack');
const merge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const webpackClient = require('./webpack.client.js');

module.exports = merge.smart(webpackClient, {
  plugins: [new BundleAnalyzerPlugin()],
});

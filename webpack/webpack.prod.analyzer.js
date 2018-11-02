const merge = require('webpack-merge');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const webpackClient = require('./webpack.prod.client.js');

module.exports = merge.smart(webpackClient, {
  plugins: [new BundleAnalyzerPlugin()],
});

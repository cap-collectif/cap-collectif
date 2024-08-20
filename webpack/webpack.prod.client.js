const { merge } = require('webpack-merge')
const TerserPlugin = require('terser-webpack-plugin')
const webpackConfig = require('./config')
const devConf = require('./webpack.client')

const prodConf = {
  mode: 'production',
  stats: 'minimal',
  cache: false,

  output: {
    pathinfo: false,
    publicPath: '/',
    filename: 'js/[name].js',
    chunkFilename: 'js/chunks/[id].[chunkhash].js',
    path: webpackConfig.outputDir,
  },

  // Don't attempt to continue if there are any errors.
  bail: true,
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            ecma: 5,
          },
          mangle: {
            safari10: true,
          },
          format: {
            comments: false,
            ecma: 5,
            // Turned on because emoji and regex is not minified properly using default
            ascii_only: true,
          },
        },
        extractComments: false,
        // Explicitly set the number of CPUs to use.
        // https://webpack.js.org/plugins/terser-webpack-plugin/#parallel
        parallel: 2,
      }),
    ],

    splitChunks: {
      cacheGroups: {
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2,
        },
      },
    },
  },
}

module.exports = merge(devConf, prodConf)

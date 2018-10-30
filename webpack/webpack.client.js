const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const webpackConfig = require('./config');

const devConf = {
  output: {
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    filename: '[name].js',
    path: webpackConfig.outputDir,
  },
  entry: {
    vendor: [
      path.join(webpackConfig.bowerDir, 'Readmore.js/readmore.min.js'),
      path.join(webpackConfig.bowerDir, 'ckeditor/ckeditor.js'),

      path.join(webpackConfig.bowerDir, 'bootstrap-sass/assets/javascripts/bootstrap/affix.js'),
      path.join(webpackConfig.bowerDir, 'bootstrap-sass/assets/javascripts/bootstrap/alert.js'),
      path.join(webpackConfig.bowerDir, 'bootstrap-sass/assets/javascripts/bootstrap/button.js'),
      path.join(webpackConfig.bowerDir, 'bootstrap-sass/assets/javascripts/bootstrap/carousel.js'),
      path.join(webpackConfig.bowerDir, 'bootstrap-sass/assets/javascripts/bootstrap/collapse.js'),
      path.join(webpackConfig.bowerDir, 'bootstrap-sass/assets/javascripts/bootstrap/modal.js'),
      path.join(webpackConfig.bowerDir, 'bootstrap-sass/assets/javascripts/bootstrap/tooltip.js'),
      path.join(webpackConfig.bowerDir, 'bootstrap-sass/assets/javascripts/bootstrap/popover.js'),
      path.join(webpackConfig.bowerDir, 'bootstrap-sass/assets/javascripts/bootstrap/tab.js'),
      path.join(
        webpackConfig.bowerDir,
        'bootstrap-sass/assets/javascripts/bootstrap/transition.js',
      ),

      path.join(webpackConfig.bowerDir, 'es6-promise/promise.js'),
      path.join(webpackConfig.bowerDir, 'intl/Intl.js'),
      path.join(webpackConfig.bowerDir, 'intl/locale-data/jsonp/fr.js'),

      path.join(webpackConfig.bowerDir, 'fetch/fetch.js'),
      path.join(webpackConfig.appDir, 'Resources/js/jsapi.js'),
      path.join(webpackConfig.appDir, 'Resources/js/googleCharts.js'),
      path.join(webpackConfig.appDir, 'Resources/js/browserUpdate.js'),
      path.join(webpackConfig.appDir, 'Resources/js/modernizr.js'),
    ],
    app: [
      path.join(webpackConfig.appDir, 'Resources/js/app.js'),
      path.join(webpackConfig.appDir, 'Resources/js/registration.js'),
    ],
    'ckeditor/ckeditor': [path.join(webpackConfig.bowerDir, 'ckeditor/ckeditor.js')],
  },
  mode: 'development',
  plugins: [
    // Add some progress infos
    new webpack.ProgressPlugin(),
    // Remove a warning with es6-polyfill
    new webpack.IgnorePlugin(/vertx/),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code.
    new MomentLocalesPlugin({
      localesToKeep: ['fr', 'en-gb', 'es'],
    }),
    // Copy some legacy deps
    new CopyWebpackPlugin([
      {
        from: path.resolve(
          __dirname,
          '../bower_components/jquery-minicolors/jquery.minicolors.min.js',
        ),
        to: path.resolve(__dirname, '../web/js/jquery.minicolors.js'),
      },
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [
          path.join(webpackConfig.absoluteBase, 'node_modules'),
          /(\-test\.js|\.snap|\-stories\.js)$/,
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
              // Don't waste time on Gzipping the cache
              cacheCompression: false,
              // If an error happens in a package, it's possible to be
              // because it was compiled. Thus, we don't want the browser
              // debugger to show the original code. Instead, the code
              // being evaluated would be much more helpful.
              sourceMaps: false,
            },
          },
        ],
      },
    ],
  },
};

module.exports = devConf;

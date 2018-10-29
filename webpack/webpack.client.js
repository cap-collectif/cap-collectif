const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const webpackConfig = require('./config');

const devConf = {
  output: {
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
    new webpack.ProgressPlugin({ profile: true }),
    new webpack.IgnorePlugin(/vertx/),
    new MomentLocalesPlugin({
      localesToKeep: ['fr', 'en-gb', 'es'],
    }),
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
        test: /(\.js|\.jsx)$/,
        exclude: [
          path.join(webpackConfig.absoluteBase, 'node_modules'),
          /(\-test\.js|\.snap|\-stories\.js)$/,
        ],
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
        ],
      },
    ],
  },
  optimization: {
    minimizer: [
      new UglifyJSPlugin({
        cache: true,
        parallel: true,
        sourceMap: true,
      }),
    ],
  },
};

module.exports = devConf;

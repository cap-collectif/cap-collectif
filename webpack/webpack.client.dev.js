/* eslint-disable  sorting/sort-object-props */
/* eslint-disable flowtype/require-valid-file-annotation */

const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');

const webpackConfig = require('./config');

const devConf = {
  output: {
    filename: '[name].js',
    path: webpackConfig.outputDir,
  },
  entry: {
    vendor: [
      //webpackConfig.nodeModulesDir,
      path.join(webpackConfig.bowerDir, 'jquery/dist/jquery.js'),
      path.join(webpackConfig.bowerDir, 'Readmore.js/readmore.min.js'),
      path.join(webpackConfig.bowerDir, 'ckeditor/ckeditor.js'),

      // Bootstrap js modules
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

      // safari polyfills
      path.join(webpackConfig.bowerDir, 'es6-promise/promise.js'),
      path.join(webpackConfig.bowerDir, 'intl/Intl.js'),
      path.join(webpackConfig.bowerDir, 'intl/locale-data/jsonp/fr.js'),
      // end
      ///^node_modules/,

      path.join(webpackConfig.bowerDir, 'fetch/fetch.js'),

      path.join(webpackConfig.appDir, 'Resources/js/jsapi.js'),
      path.join(webpackConfig.appDir, 'Resources/js/googleCharts.js'),

      path.join(webpackConfig.appDir, 'Resources/js/browserUpdate.js'),
      path.join(webpackConfig.appDir, 'Resources/js/modernizr.js'),
    ],
    app: [path.join(webpackConfig.appDir, 'Resources/js/app.js')],
    'ckeditor/ckeditor': [path.join(webpackConfig.bowerDir, 'ckeditor/ckeditor.js')],
    'jquery.minicolors': [
      path.join(webpackConfig.bowerDir, 'jquery-minicolors/jquery.minicolors.js'),
    ],
  },
  mode: 'development',
  plugins: [
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|svg|woff|swf|zip|woff2|ttf|eot|ico|otf|pdf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'fonts',
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: 'resolve-url-loader',
            options: {
              root: webpackConfig.ressourcesDir,
            },
          },
          {
            loader: 'sass-loader',
          },
        ],
      },
      {
        test: /(\.js|\.jsx)$/,
        exclude: [
          path.join(webpackConfig.absoluteBase, 'node_modules'),
          /(\-test\.js|\.snap|\-stories\.js)$/,
        ],
        use: [
          {
            loader: 'babel-loader',
          },
        ],
      },
    ],
  },
};

module.exports = devConf;

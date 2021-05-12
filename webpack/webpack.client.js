// @flow

const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');

const webpackConfig = require('./config');

const webpackJsx = require('./rules/webpack.jsx.js')();
const webpackScss = require('./rules/webpack.scss.js')();
const webpackFile = require('./rules/webpack.file.js')();

const devConf = {
  mode: 'development',
  target: 'web',

  output: {
    pathinfo: true,
    publicPath: '/',
    filename: 'js/[name].js',
    chunkFilename: 'js/chunks/[name].js',
    path: webpackConfig.outputDir,
  },

  resolve: {
    alias: {
      '~relay': path.resolve(__dirname, '../frontend/js/__generated__/~relay'),
      '~ui': path.resolve(__dirname, '../frontend/js/components/Ui'),
      '~ds': path.resolve(__dirname, '../frontend/js/components/DesignSystem'),
      '~': path.resolve(__dirname, '../frontend/js'),
      '~fonts': path.resolve(__dirname, '../public/fonts'),
      '~svg': path.resolve(__dirname, '../public/svg'),
      '~image': path.resolve(__dirname, '../public/image'),
      react: path.resolve('./node_modules/react'),
      'lodash-es': 'lodash',
    },
    fallback: {
      stream: require.resolve('stream-browserify'),
      zlib: require.resolve('browserify-zlib'),
    },
  },

  cache: {
    type: 'filesystem',
  },

  entry: {
    vendor: [
      path.join(
        webpackConfig.nodeModulesDir,
        'bootstrap-sass/assets/javascripts/bootstrap/alert.js',
      ),
      path.join(
        webpackConfig.nodeModulesDir,
        'bootstrap-sass/assets/javascripts/bootstrap/tooltip.js',
      ),
      path.join(webpackConfig.frontendDir, 'js/jsapi.js'),
      path.join(webpackConfig.frontendDir, 'js/googleCharts.js'),
      path.join(webpackConfig.frontendDir, 'js/browserUpdate.js'),
      path.join(webpackConfig.frontendDir, 'js/modernizr.js'),
      path.join(webpackConfig.nodeModulesDir, 'quill/dist/quill.core.css'),
      path.join(webpackConfig.nodeModulesDir, 'quill/dist/quill.snow.css'),
      path.join(webpackConfig.nodeModulesDir, 'react-datetime/css/react-datetime.css'),
      path.join(webpackConfig.nodeModulesDir, 'leaflet/dist/leaflet.css'),
      path.join(webpackConfig.nodeModulesDir, 'leaflet-geosearch/dist/geosearch.css'),
      path.join(webpackConfig.assetsDir, 'js/fancybox/jquery.fancybox.css'),
    ],

    // Common file for JS
    app: path.join(webpackConfig.frontendDir, 'js/app.js'),

    admin: path.join(webpackConfig.frontendDir, 'js/registrationAdmin.js'),
    front: [
      path.join(webpackConfig.frontendDir, 'js/registration.js'),
      path.join(webpackConfig.srcDir, 'Resources/scss/style.scss'),
    ],

    // We separate print.css because it is needed only in the printed pages
    print: path.join(webpackConfig.srcDir, 'Resources/scss/print.scss'),

    // Same as print but for backoffice
    'style-admin': [
      path.join(webpackConfig.srcDir, 'Resources/scss/style-admin.scss'),
      path.join(webpackConfig.nodeModulesDir, 'jquery-minicolors/jquery.minicolors.css'),
    ],
  },

  optimization: {
    removeAvailableModules: false,
    removeEmptyChunks: false,
    splitChunks: false,
  },

  plugins: [
    new MomentTimezoneDataPlugin({
      matchZones: [
        'America/New_York',
        'America/Toronto',
        'Europe/Brussels',
        'Indian/Reunion',
        'America/Blanc-Sablon',
        'Europe/Paris',
        'Etc/UTC',
      ],
    }),
    new CleanWebpackPlugin({
      // Simulate the removal of files
      dry: false,
      // Path files removed (Relative to webpack's output.path directory)
      cleanOnceBeforeBuildPatterns: ['js/chunks/*'],
    }),
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /a\.js|node_modules/,
      // add errors to webpack instead of warnings
      failOnError: false,
      // allow import cycles that include an asyncronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      // set the current working directory for displaying module paths
      cwd: process.cwd(),
    }),
    // This plugin extracts CSS into separate files located in /css folder
    new MiniCssExtractPlugin({
      filename: 'css/[name].css',
    }),
    // Add some progress infos
    new webpack.ProgressPlugin(),
    // Remove a warning with es6-polyfill
    new webpack.IgnorePlugin(/vertx/),
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code.
    new MomentLocalesPlugin({
      // Locale names follow Moment.js behavior
      // – if a specific locale name (e.g. ru-ru) is absent, but a more generic locale (ru) is available,
      // the generic one will be kept bundled.
      localesToKeep: webpackConfig.locales,
      ignoreInvalidLocales: true,
    }),
    // Copy some legacy deps
    // TODO: Remove this legacy deps
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(
            __dirname,
            '../node_modules/jquery-minicolors/jquery.minicolors.min.js',
          ),
          to: path.resolve(__dirname, '../public/js/jquery.minicolors.js'),
        },
        {
          from: path.resolve(__dirname, '../node_modules/jquery-minicolors/jquery.minicolors.png'),
          to: path.resolve(__dirname, '../public/css/jquery.minicolors.png'),
        },
        {
          from: path.resolve(__dirname, '../assets/js/'),
          to: path.resolve(__dirname, '../public/js/'),
        },
      ],
    }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
      process: 'process/browser',
    }),
  ],
};

module.exports = merge(devConf, webpackJsx, webpackFile, webpackScss);

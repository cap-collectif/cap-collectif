const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const AutoprefixerPlugin = require('autoprefixer');
const CssNano = require('cssnano');

function getRulesConf() {
  return {
    module: {
      rules: [
        {
          test: /\.(css|scss)$/i,
          use: [
            {
              // This plugin extracts CSS into separate files
              loader: MiniCssExtractPlugin.loader,
              options: {
                publicPath: '../../',
              },
            },
            {
              loader: 'css-loader', // translates CSS into CommonJS modules
              options: {
                // Number of loader after css-loader: post-css and sass-loader
                importLoaders: 2,
              },
            },
            {
              // Postcss provide a CSS parser and a framework to add plugins
              loader: 'postcss-loader',
              options: {
                // webpack requires an identifier here, it can be freely named as long as it is unique.
                ident: 'postcss',
                plugins: [
                  AutoprefixerPlugin, // AutoPrefix parse CSS and add vendor prefixes to CSS rules
                  CssNano, // Cssnano takes the CSS and runs it through many focused optimisations
                ],
              },
            },
            {
              loader: 'sass-loader', // compiles Sass to CSS
            },
          ],
        },
      ],
    },
  };
}

module.exports = getRulesConf;

// @flow
const webpackConfig = require('../config');

function getRulesConf() {
  return {
    module: {
      rules: [
        {
          test: /\.(woff|woff2|ttf|eot|svg)$/,
          exclude: [webpackConfig.frontendDir, `${webpackConfig.outputDir}/svg`],
          use: 'url-loader',
        },
        {
          test: /\.(png|jpe?g|gif|swf|zip|ico|otf|pdf)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]',
                outputPath: 'media',
              },
            },
          ],
        },
        {
          test: /\.svg$/,
          use: [
            {
              loader: '@svgr/webpack',
              options: {
                icon: true,
                titleProp: true,
              },
            },
          ],
        },
      ],
    },
  };
}

module.exports = getRulesConf;

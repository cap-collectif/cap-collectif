const webpackConfig = require('../config');

function getRulesConf() {
  return {
    module: {
      rules: [
        {
          test: /\.(woff|woff2|ttf|eot|svg)$/,
          exclude: [webpackConfig.frontendDir, `${webpackConfig.outputDir}/svg`, webpackConfig.nextDir],
          use: [
            {
              loader: 'file-loader',
              options: {
                emitFile: false, // Don't create a file
                name: file => {
                  const pathFile = file.split('/');
                  const fontName = pathFile[pathFile.length - 1];

                  // Don't use [folder] for slick font (used for slick-carousel)
                  // because the file is in "fonts" folder in node_modules that we don't need
                  if (fontName.includes('slick')) {
                    return 'fonts/[name].[ext]';
                  }

                  return 'fonts/[folder]/[name].[ext]';
                },
              },
            },
          ],
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

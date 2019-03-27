function getRulesConf() {
  return {
    module: {
      rules: [
        {
          test: /\.(woff|woff2|ttf|eot|svg)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: 'fonts/[name].[ext]',
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
      ],
    },
  };
}

module.exports = getRulesConf;

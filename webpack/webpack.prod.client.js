const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

const devConf = require('./webpack.client');

const prodConf = {
  mode: 'production',
  // Don't attempt to continue if there are any errors.
  bail: true,
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          parse: {
            // we want terser to parse ecma 8 code. However, we don't want it
            // to apply any minfication steps that turns valid ecma 5 code
            // into invalid ecma 5 code. This is why the 'compress' and 'output'
            // sections only apply transformations that are ecma 5 safe
            ecma: 8,
          },
          compress: {
            ecma: 5,
            warnings: false,
            // Disabled because of an issue with Uglify breaking seemingly valid code:
            comparisons: false,
            // Disabled because of an issue with Terser breaking valid code:
            inline: 2,
          },
          mangle: {
            safari10: true,
          },
          output: {
            ecma: 5,
            comments: false,
            // Turned on because emoji and regex is not minified properly using default
            ascii_only: true,
          },
        },
        // Enable file caching
        cache: true,
      }),
    ],
  },
};

module.exports = merge.smart(devConf, prodConf);

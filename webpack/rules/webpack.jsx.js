const path = require('path');
const webpackConfig = require('../config');

function getRulesConf() {
  return {
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
                // This is a feature of `babel-loader` for webpack (not Babel itself).
                // It enables caching results in ./node_modules/.cache/babel-loader/
                // directory for faster rebuilds.
                cacheDirectory: true,
                // Don't waste time on Gzipping the cache
                cacheCompression: false,
              },
            },
          ],
        },
      ],
    },
  };
}

module.exports = getRulesConf;

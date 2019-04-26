function getRulesConf() {
  return {
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/i,
          exclude: [
            /(-test\.js|\.snap|-stories\.js)$/,
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

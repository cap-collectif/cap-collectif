const merge = require('webpack-merge');

const devConf = require('./webpack.client')

const prodConf = {
  mode: 'production'
}

module.exports = merge.smart(devConf, prodConf);

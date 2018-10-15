/* eslint-disable  sorting/sort-object-props */
/* eslint-disable flowtype/require-valid-file-annotation */

const merge = require('webpack-merge');

const devConf = require('./webpack.client')

const prodConf = {
  mode: 'production'
}

module.exports = merge.smart(devConf, prodConf);

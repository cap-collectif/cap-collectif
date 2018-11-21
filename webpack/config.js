const path = require('path');

const ABSOLUTE_BASE = path.resolve('.');

const config = {
  absoluteBase: ABSOLUTE_BASE,
  outputDir: path.join(ABSOLUTE_BASE, 'web/js'),
  nodeModulesDir: path.join(ABSOLUTE_BASE, 'node_modules'),
  ressourcesDir: path.join(ABSOLUTE_BASE, 'app/Ressources'),
  srcDir: path.join(ABSOLUTE_BASE, 'src'),
  bowerDir: path.join(ABSOLUTE_BASE, 'bower_components'),
  appDir: path.join(ABSOLUTE_BASE, 'app'),
  webpackDir: path.join(ABSOLUTE_BASE, 'webpack'),
};

module.exports = config;

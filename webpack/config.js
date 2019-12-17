const path = require('path');

const ABSOLUTE_BASE = path.resolve('.');

const config = {
  absoluteBase: ABSOLUTE_BASE,
  outputDir: path.join(ABSOLUTE_BASE, 'public'),
  nodeModulesDir: path.join(ABSOLUTE_BASE, 'node_modules'),
  ressourcesDir: path.join(ABSOLUTE_BASE, 'app/Ressources'),
  srcDir: path.join(ABSOLUTE_BASE, 'src'),
  frontendDir: path.join(ABSOLUTE_BASE, 'frontend'),
  appDir: path.join(ABSOLUTE_BASE, 'app'),
  assetsDir: path.join(ABSOLUTE_BASE, 'assets'),
  webpackDir: path.join(ABSOLUTE_BASE, 'webpack'),
  locales: ['fr-FR', 'es-ES', 'en-GB', 'de-DE', 'nl-NL'],
};

module.exports = config;

const path = require('path');

const ABSOLUTE_BASE = path.resolve('.');

const config = {
  absoluteBase: ABSOLUTE_BASE,
  outputDir: path.join(ABSOLUTE_BASE, 'web'),
  nodeModulesDir: path.join(ABSOLUTE_BASE, 'node_modules'),
  ressourcesDir: path.join(ABSOLUTE_BASE, 'app/Ressources'),
  srcDir: path.join(ABSOLUTE_BASE, 'src'),
  appDir: path.join(ABSOLUTE_BASE, 'app'),
  webpackDir: path.join(ABSOLUTE_BASE, 'webpack'),
  locales: ['fr-FR', 'es-ES', 'en-GB', 'de-DE', 'nl-NL'],
  include: [
    path.join(__dirname, 'node_modules/react-intl'),
    path.join(__dirname, 'node_modules/intl-messageformat'),
    path.join(__dirname, 'node_modules/intl-messageformat-parser'),
  ],
};

module.exports = config;

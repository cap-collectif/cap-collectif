#!/bin/bash

if [ "$PRODUCTION" ]; then
  echo "Building for production"
  # We create var directory used by Symfony
  mkdir -m 777 -p var
  # We install vendors with composer
  # We don't use `--no-scripts` or `--no-plugins` because a script in a composer plugin
  # will generate the file vendor/ocramius/package-versions/src/PackageVersions/Versions.php
  composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-progress --ignore-platform-reqs
  # We build bootstrap.php.cache in the `var` directory
  php vendor/sensio/distribution-bundle/Resources/bin/build_bootstrap.php var

  # Frontend deps
  npm --quiet --no-color install --production
  bower install --config.interactive=false --allow-root --config.storage.cache=/home/capco/.cache/bower
  NODE_ENV=production npm run build:prod

  # Server side rendering deps
  NODE_ENV=production npm run build-server-bundle
else
  echo "Building for development"
  # Symfony deps
  composer install --prefer-dist --no-interaction --ignore-platform-reqs
  composer dump-autoload

  # Frontend deps
  npm install
  npm rebuild node-sass
  bower install --config.interactive=false --config.storage.cache=/home/capco/.bower
  npm run build

  # Server side rendering deps
  npm run build-server-bundle
fi

#!/bin/bash

if [ "$PRODUCTION" ]; then
  echo "Building for production"
  # We create var directory used by Symfony
  mkdir -m 777 -p var || exit 1
  # We install vendors with composer
  # We don't use `--no-scripts` or `--no-plugins` because a script in a composer plugin
  # will generate the file vendor/ocramius/package-versions/src/PackageVersions/Versions.php
  composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-progress --ignore-platform-reqs || exit 1
  # We build bootstrap.php.cache in the `var` directory
  php vendor/sensio/distribution-bundle/Resources/bin/build_bootstrap.php var || exit 1

  # Frontend deps
  npm --quiet --no-color install --production || exit 1
  bower install --config.interactive=false --allow-root --config.storage.cache=/home/capco/.cache/bower || exit 1
  npm run build:prod || exit 1

  # Server side rendering deps
  npm run build-server-bundle:prod || exit 1
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

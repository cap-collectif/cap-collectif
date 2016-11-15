#!/bin/bash

if [ "$PRODUCTION" ]; then
  echo "Building for production"
  # We create var directory used by Symfony
  mkdir -m 777 -p var || exit 1
  # We install vendors with composer
  # We don't use `--no-scripts` or `--no-plugins` because a script in a composer plugin
  # will generate the file vendor/ocramius/package-versions/src/PackageVersions/Versions.php
  composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --ignore-platform-reqs || exit 1
  # We build bootstrap.php.cache in the `var` directory
  php vendor/sensio/distribution-bundle/Resources/bin/build_bootstrap.php var || exit 1

  # Frontend deps
  yarn install --pure-lockfile || exit 1
  bower install --config.interactive=false --allow-root || exit 1
  yarn run build:prod || exit 1

  # Server side rendering deps
  yarn run build-server-bundle:prod || exit 1
else
  echo "Building for development"
  # Symfony deps
  composer install --prefer-dist --no-interaction --ignore-platform-reqs
  composer dump-autoload

  # Frontend deps
  yarn install --pure-lockfile
  bower install --config.interactive=false
  echo "Testing node-sass binding..."
  if ./node_modules/node-sass/bin/node-sass >/dev/null 2>&1 | grep --quiet `npm rebuild node-sass` >/dev/null 2>&1; then
      echo "Building node-sass binding for the container..."
      npm rebuild node-sass > /dev/null
  fi
  echo "Binding ready!"
  yarn run build

  # Server side rendering deps
  yarn run build-server-bundle
fi

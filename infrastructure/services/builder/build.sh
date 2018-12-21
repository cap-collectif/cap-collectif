#!/bin/bash
set -e

if [ "$PRODUCTION" ]; then
  echo "Building for production"
  # We create var directory used by Symfony
  mkdir -m 777 -p var
  # We install vendors with composer
  # We don't use `--no-scripts` or `--no-plugins` because a script in a composer plugin
  # will generate the file vendor/ocramius/package-versions/src/PackageVersions/Versions.php
  composer install --no-dev --prefer-dist --no-interaction --ignore-platform-reqs --no-progress

  echo "Configure simplesamlphp library"
  rm -rf vendor/simplesamlphp/simplesamlphp/config/*
  rm -rf vendor/simplesamlphp/simplesamlphp/metadata/*
  rm -rf vendor/simplesamlphp/simplesamlphp/cert
  cp -R app/config/simplesamlphp vendor/simplesamlphp

  # We generate GraphQL/__generated__
  echo "Generating GraphQL PHP files…"
  bin/console graphql:compile

  echo "Generating Composer autoload…"
  composer dump-autoload --no-dev --optimize --apcu

  # Frontend deps
  yarn install --pure-lockfile --production=false
  bower install --config.interactive=false --allow-root

  echo "Building node-sass binding for the container..."
  npm rebuild node-sass > /dev/null

  php bin/console translation:download --env=prod
  yarn run update-js-translation
  yarn run build-relay-schema
  yarn run build:prod

  # For now SSR is disabled, so we skip this to avoid extra work
  # yarn run build-server-bundle:prod
else
  echo "Building for development/testing"
  # Symfony deps
  if [ -n "CI" ]; then
      composer install --prefer-dist --no-interaction --ignore-platform-reqs --no-suggest --no-progress
  else
      composer install --prefer-dist --no-interaction --ignore-platform-reqs
  fi

  echo "Configure simplesamlphp library"
  rm -rf vendor/simplesamlphp/simplesamlphp/config/*
  rm -rf vendor/simplesamlphp/simplesamlphp/metadata/*
  rm -rf vendor/simplesamlphp/simplesamlphp/cert
  cp -R app/config/simplesamlphp vendor/simplesamlphp

  # We generate GraphQL/__generated__
  echo "Generating GraphQL PHP files…"
  bin/console graphql:compile
  
  echo "Generating Composer autoload…"
  composer dump-autoload --optimize --apcu

  # Frontend deps
  yarn install --pure-lockfile --production=false
  bower install --config.interactive=false --allow-root

  echo "Testing node-sass binding..."
  if ./node_modules/node-sass/bin/node-sass >/dev/null 2>&1 | grep --quiet `npm rebuild node-sass` >/dev/null 2>&1; then
      echo "Building node-sass binding for the container..."
      npm rebuild node-sass > /dev/null
  fi
  echo "Binding ready!"

  echo "Downloading translations…"
  yarn run trad

  echo "Generating Relay files…"
  yarn run build-relay-schema

  if [ -n "CI" ]; then
    yarn run build:prod
    # For now SSR is disabled, so we skip this to avoid extra work
    # yarn run build-server-bundle:prod
  else
    yarn run build
    # For now SSR is disabled, so we skip this to avoid extra work
    # yarn run build-server-bundle
  fi
fi

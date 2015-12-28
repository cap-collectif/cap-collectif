#!/bin/bash

mkdir -m 777 -p /var/www/var

if [ "$PRODUCTION" ]; then
  echo "Building for production"
  # Symfony deps
  composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-scripts
  php vendor/sensio/distribution-bundle/Sensio/Bundle/DistributionBundle/Resources/bin/build_bootstrap.php var

  # Frontend deps
  npm install --production
  bower install --config.interactive=false --allow-root --config.storage.cache=/home/capco/.cache/bower
  brunch build --production
else
  echo "Building for development"
  # Symfony deps
  composer install --prefer-dist --no-interaction --no-scripts
  php vendor/sensio/distribution-bundle/Sensio/Bundle/DistributionBundle/Resources/bin/build_bootstrap.php var

  # Frontend deps
  npm install
  npm rebuild node-sass
  bower install --config.interactive=false --config.storage.cache=/home/capco/.bower
  brunch build
fi

cd /var/www
php bin/console cache:warmup --no-debug --no-optional-warmers --env=prod --no-interaction
php bin/console assets:install --symlink --env=prod --no-interaction

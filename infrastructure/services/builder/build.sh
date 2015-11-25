#!/bin/bash

if [ "$PRODUCTION" ]; then
  echo "Building for production"
  # Symfony deps
  composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-scripts
  php vendor/sensio/distribution-bundle/Sensio/Bundle/DistributionBundle/Resources/bin/build_bootstrap.php

  # Frontend deps
  npm install --production
  bower install --config.interactive=false --allow-root --config.storage.cache=/home/capco/.cache/bower
  brunch build --production
else
  echo "Building for development"
  # Symfony deps
  composer install --prefer-dist --no-interaction --no-scripts
  php vendor/sensio/distribution-bundle/Sensio/Bundle/DistributionBundle/Resources/bin/build_bootstrap.php

  # Frontend deps
  npm install
  bower install --config.interactive=false
  brunch build
fi

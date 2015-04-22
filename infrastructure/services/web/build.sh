#!/bin/bash

# Composer install for worker
cd /var/www/
SYMFONY_ENV=prod composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-scripts

mkdir -p /var/www/app/cache
php vendor/sensio/distribution-bundle/Sensio/Bundle/DistributionBundle/Resources/bin/build_bootstrap.php

# Brunch generation / Bower
npm install
bower install
node_modules/brunch/bin/brunch build --production

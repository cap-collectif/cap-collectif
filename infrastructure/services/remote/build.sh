#!/bin/bash

composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-scripts
php vendor/sensio/distribution-bundle/Sensio/Bundle/DistributionBundle/Resources/bin/build_bootstrap.php

# Brunch generation / Bower
npm install --production
bower install --config.interactive=false --allow-root
node_modules/brunch/bin/brunch build --production

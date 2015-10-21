#!/bin/bash

# Composer install for worker
composer install --prefer-dist --no-interaction --no-scripts
php vendor/sensio/distribution-bundle/Sensio/Bundle/DistributionBundle/Resources/bin/build_bootstrap.php

# Brunch generation / Bower
npm install
bower install --config.interactive=false
brunch build

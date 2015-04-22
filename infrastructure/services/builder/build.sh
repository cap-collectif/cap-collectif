#!/bin/bash

# Composer install for worker
cd /capco/
SYMFONY_ENV=prod composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-scripts

# Brunch generation / Bower
npm install
bower install
node_modules/brunch/bin/brunch build --production

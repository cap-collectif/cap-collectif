#!/bin/bash -e

sed -i 's/newrelic.appname = "PHP Application"/newrelic.appname = '"$NR_INSTALL_NAME"'/' /etc/php5/fpm/conf.d/20-newrelic.ini
sed -i 's/newrelic.license = ""/newrelic.license = '"$NR_INSTALL_KEY"'/' /etc/php5/fpm/conf.d/20-newrelic.ini

exec "$@"

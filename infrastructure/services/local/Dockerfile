FROM debian:jessie

MAINTAINER Aurélien David <adavid@jolicode.com>

# Install basic
RUN apt-get update && \
    apt-get install -y wget apt-transport-https curl cron imagemagick runit locales && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install nginx, php, mysql client and redis client
RUN echo "deb http://packages.dotdeb.org jessie all" > /etc/apt/sources.list.d/dotdeb.list && \
    echo "deb-src http://packages.dotdeb.org jessie all" >> /etc/apt/sources.list.d/dotdeb.list && \
    wget http://www.dotdeb.org/dotdeb.gpg -O- -q | apt-key add - && \
    apt-get update && \
    apt-get install -y -qq mysql-client redis-tools nginx php5-fpm php5-cli php5-curl php5-intl php5-mysql php5-xsl php5-redis php5-gd php5-imagick && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install varnish
RUN apt-get update && \
    wget https://repo.varnish-cache.org/debian/GPG-key.txt -O- -q | apt-key add - && \
    echo "deb https://repo.varnish-cache.org/debian/ jessie varnish-4.0" >> /etc/apt/sources.list.d/varnish-cache.list && \
    apt-get update && \
    apt-get install -y varnish && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install fake user 1000
RUN groupadd --gid=1000 capco && \
    /usr/sbin/useradd --system --uid 1000 --home /home/capco --shell /bin/bash --gid 1000 capco

# Service
COPY nginx/run                  /etc/service/nginx/run
COPY php-fpm/run                /etc/service/php-fpm/run
COPY cron/run                   /etc/service/cron/run
COPY varnish/run                /etc/service/varnish/run

# Configuration
COPY nginx/nginx.conf           /etc/nginx/nginx.conf
COPY php-fpm/fpm.conf           /etc/service/php-fpm/fpm.conf
COPY php-fpm/capco.ini          /etc/php5/fpm/conf.d/capco.ini
COPY php-fpm/capco.ini          /etc/php5/cli/conf.d/capco.ini
COPY cron/crontab               /etc/cron.d/crontab
COPY varnish/capco.vcl          /etc/varnish/capco.vcl

# Volume for log / cache ...
VOLUME /var/www/var/cache
VOLUME /var/www/var/logs

WORKDIR /var/www

CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

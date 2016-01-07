FROM debian:jessie

MAINTAINER Aurélien David <adavid@jolicode.com>

# Install basic
RUN apt-get update && \
    apt-get install -y wget apt-transport-https curl cron imagemagick runit locales && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install php7.0
RUN echo "deb http://packages.dotdeb.org jessie all" > /etc/apt/sources.list.d/dotdeb.list && \
    echo "deb-src http://packages.dotdeb.org jessie all" >> /etc/apt/sources.list.d/dotdeb.list && \
    wget http://www.dotdeb.org/dotdeb.gpg -O- -q | apt-key add - && \
    apt-get update && \
    apt-get install -y -qq \
        php7.0-fpm \
        php7.0-cli \
        php7.0-curl \
        php7.0-intl \
        php7.0-mysql \
        php7.0-opcache \
        php7.0-json \
        php7.0-dev \
        #### libapache2-mod-php7.0 \
        # php7.0-xsl \
        # php7.0-redis \
        php7.0-gd && \
        # php7.0-imagick && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Temporary phpredis extension installation
RUN apt-get update && \
    apt-get install -y git make && \
    git clone https://github.com/phpredis/phpredis.git && cd phpredis && git checkout php7 && phpize && ./configure && make && make install && rm -rf phpredis \
    && cd /etc/php/mods-available && echo "extension=redis.so" > redis.ini && cd /etc/php/7.0/fpm/conf.d/ && ln -sf /etc/php/mods-available/redis.ini ./20-redis.ini \
    && cd /etc/php/7.0/cli/conf.d/ && ln -sf /etc/php/mods-available/redis.ini ./20-redis.ini

# Temporary imagick extension installation
RUN apt-get install pkg-config libmagickwand-dev -y && \
    # cd /tpm && \
    wget http://pecl.php.net/get/imagick-3.4.0RC2.tgz && \
    tar xvzf imagick-3.4.0RC2.tgz && \
    cd imagick-3.4.0RC2 && \
    phpize && \
    ./configure && \
    make install && \
    rm -rf /tmp/imagick-3.4.0RC2* && \
    echo extension=imagick.so >> /etc/php/7.0/cli/php.ini && \
    echo extension=imagick.so >> /etc/php/7.0/fpm/php.ini

# Install nginx, mysql client and redis client
RUN apt-get update && \
    apt-get install -y -qq \
    mysql-client \
    redis-tools \
    nginx && \
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
COPY php-fpm/capco.ini          /etc/php7.0/fpm/conf.d/capco.ini
COPY php-fpm/capco.ini          /etc/php7.0/cli/conf.d/capco.ini
COPY cron/crontab               /etc/cron.d/crontab
COPY varnish/capco.vcl          /etc/varnish/capco.vcl

# Volume for log / cache ...
VOLUME /var/www/var/cache
VOLUME /var/www/var/logs

WORKDIR /var/www

CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

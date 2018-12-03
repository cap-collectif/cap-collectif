FROM debian:stretch

# Install basic
RUN apt-get update && \
    apt-get install -y -qq --fix-missing \
        apt-transport-https \
        build-essential \
        cron \
        curl \
        imagemagick \
        libmagickwand-dev \
        locales \
        pkg-config \
        runit \
        wget \
        libicu-dev \
        gnupg2 \
        ca-certificates \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install php
RUN wget -O- https://packages.sury.org/php/apt.gpg | apt-key add - && \
    echo "deb https://packages.sury.org/php/ stretch main" > /etc/apt/sources.list.d/php.list && \
    apt-get update && \
    apt-get install -y -qq \
        php7.1-apcu \
        php7.1-apc \
        php7.1-cli \
        php7.1-mbstring \
        php7.1-common \
        php7.1-curl \
        php7.1-dev \
        php7.1-fpm \
        php7.1-gd \
        php7.1-imagick \
        php7.1-intl \
        php7.1-json \
        php7.1-sqlite3 \
        php7.1-mysql \
        php7.1-opcache \
        php7.1-redis \
        php7.1-xsl \
        php7.1-zip \
        php-xdebug \
        php-amqp \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install nodejs and deps for npm install
ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_VERSION 8.12.0
RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

# Install blackfire PHP Probe
RUN wget https://packagecloud.io/gpg.key -O- -q | apt-key add - && \
    echo "deb http://packages.blackfire.io/debian any main" | tee /etc/apt/sources.list.d/blackfire.list && \
    apt-get update && \
    apt-get install -y blackfire-agent blackfire-php && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /etc/apt/sources.list.d/* && \
    mkdir -p /var/run/blackfire && \
    curl -A "Docker" -o /tmp/blackfire-probe.tar.gz -D - -L -s https://blackfire.io/api/v1/releases/probe/php/linux/amd64/71 && \
    tar zxpf /tmp/blackfire-probe.tar.gz -C /tmp && \
    mv /tmp/blackfire-*.so $(php -r "echo ini_get('extension_dir');")/blackfire.so
COPY blackfire/blackfire-agent.ini /etc/blackfire/agent
COPY blackfire/blackfire-php.ini /etc/php/7.1/fpm/conf.d/92-blackfire-config.ini
COPY blackfire/blackfire-php.ini /etc/php/7.1/cli/conf.d/92-blackfire-config.ini

 # Install rabbitmq
ENV LANG C.UTF-8
ENV RABBITMQ_VERSION_DEB=3.6.16-2
RUN echo 'deb https://dl.bintray.com/rabbitmq/debian stretch main erlang-20.x' | tee /etc/apt/sources.list.d/bintray.rabbitmq.list && \
    wget -O- https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc | apt-key add - && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y rabbitmq-server=$RABBITMQ_VERSION_DEB && \
    rm -rf /var/lib/apt/lists/* && \
    rabbitmq-plugins enable rabbitmq_management

# Install nginx, mysql client and redis client
RUN apt-get update && \
    apt-get install -y -qq \
        sqlite \
        mysql-client \
        redis-tools \
        nginx \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install varnish
RUN apt-get update && cd /tmp \
    && wget --content-disposition https://packagecloud.io/varnishcache/varnish41/packages/debian/stretch/varnish_4.1.10-1~stretch_amd64.deb/download.deb \
    && dpkg -i varnish_4.1.10-1~stretch_amd64.deb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install Supervisor
RUN apt-get update && \
    apt-get install -y supervisor && \
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
COPY blackfire/run              /etc/service/blackfire/run
COPY rabbitmq/run               /etc/service/rabbitmq/run
# COPY nodejs/run                 /etc/service/nodejs/run

# Configuration
COPY nginx/ssl/capco.crt            /etc/ssl/certs/capco.crt
COPY nginx/ssl/capco.key            /etc/ssl/private/capco.key
COPY nginx/ssl/capco.pem            /etc/ssl/certs/capco.pem
COPY nginx/nginx.conf               /etc/nginx/nginx.conf
COPY php-fpm/fpm.conf               /etc/service/php-fpm/fpm.conf
COPY php-fpm/capco.ini              /etc/php/7.1/fpm/conf.d/capco.ini
COPY php-fpm/capco.ini              /etc/php/7.1/cli/conf.d/capco.ini
COPY xdebug/20-xdebug.ini           /etc/php/7.1/cli/conf.d/capco.ini
COPY xdebug/20-xdebug.ini           /etc/php/7.1/fpm/conf.d/capco.ini
COPY cron/crontab                   /etc/cron.d/crontab
COPY varnish/capco.vcl              /etc/varnish/capco.vcl
COPY rabbitmq/rabbitmq.config         /etc/rabbitmq/rabbitmq.config
COPY logrotate/mysql-slow-logs      /etc/logrotate.d/mysql-slow-logs
COPY supervisord/                   /etc/supervisord

# TODO: fix the perf impact of xdebug
RUN phpdismod xdebug

# Volume for log / cache ...
VOLUME /var/www/var/cache
VOLUME /var/www/var/logs

WORKDIR /var/www

CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

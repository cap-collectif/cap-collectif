FROM debian:jessie

MAINTAINER Aurélien David <adavid@jolicode.com>

RUN sed -i 's/httpredir.debian.org/debian.mirrors.ovh.net/g' /etc/apt/sources.list

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
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install php7.0
RUN wget -O- https://packages.sury.org/php/apt.gpg | apt-key add - && \
    echo "deb https://packages.sury.org/php/ jessie main" > /etc/apt/sources.list.d/php.list && \
    apt-get update && \
    apt-get install -y -qq \
        php7.0-apcu \
        php7.0-apc \
        php7.0-cli \
        php7.0-mbstring \
        php7.0-common \
        php7.0-curl \
        php7.0-dev \
        php7.0-fpm \
        php7.0-gd \
        php7.0-imagick \
        php7.0-intl \
        php7.0-json \
        php7.0-sqlite3 \
        php7.0-mysql \
        php7.0-opcache \
        php7.0-redis \
        php7.0-xsl \
        php7.0-zip \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install nodejs and deps for npm install
ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_VERSION 6.11.0
RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

# Install rabbitmq lib and php-amqp
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y vim git make cmake g++ libreadline-dev && \
    cd /tmp && \
    git clone https://github.com/alanxz/rabbitmq-c.git && \
    cd /tmp/rabbitmq-c && \
    git checkout v0.8.0 && \
    mkdir build && cd build && \
    cmake .. && \
    cmake --build . --target install && \
    ln -s /usr/local/lib64/librabbitmq.so.4.0.0 /usr/lib/librabbitmq.so.4 && \
    ln -s /usr/local/lib64/librabbitmq.so.4.0.0 /usr/lib/librabbitmq.so && \
    cd /tmp && \
    git clone https://github.com/pdezwart/php-amqp.git && \
    cd /tmp/php-amqp && \
    git checkout v1.7.1 && \
    phpize && \
    ./configure && \
    make && \
    make install && \
    echo "extension=amqp.so" > /etc/php/7.0/fpm/conf.d/20-amqp.ini && \
    echo "extension=amqp.so" > /etc/php/7.0/cli/conf.d/20-amqp.ini && \
    apt-get purge -y vim git cmake make g++ libreadline-dev && \
    apt-get autoremove -y && \
    apt-get clean all

# Install blackfire PHP Probe
RUN wget https://packagecloud.io/gpg.key -O- -q | apt-key add - && \
    echo "deb http://packages.blackfire.io/debian any main" | tee /etc/apt/sources.list.d/blackfire.list && \
    apt-get update && \
    apt-get install -y blackfire-agent blackfire-php && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /etc/apt/sources.list.d/* && \
    mkdir -p /var/run/blackfire && \
    curl -A "Docker" -o /tmp/blackfire-probe.tar.gz -D - -L -s https://blackfire.io/api/v1/releases/probe/php/linux/amd64/70 && \
    tar zxpf /tmp/blackfire-probe.tar.gz -C /tmp && \
    mv /tmp/blackfire-*.so $(php -r "echo ini_get('extension_dir');")/blackfire.so
COPY blackfire/blackfire-agent.ini /etc/blackfire/agent
COPY blackfire/blackfire-php.ini /etc/php/7.0/fpm/conf.d/92-blackfire-config.ini
COPY blackfire/blackfire-php.ini /etc/php/7.0/cli/conf.d/92-blackfire-config.ini

# Install rabbitmq
RUN echo 'deb http://www.rabbitmq.com/debian/ testing main' >> /etc/apt/sources.list.d/rabbitmq.list && \
    wget -O- https://www.rabbitmq.com/rabbitmq-release-signing-key.asc | apt-key add - && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y rabbitmq-server && \
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
RUN apt-get update && \
    apt-get install -y varnish && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

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
COPY nodejs/run                 /etc/service/nodejs/run

# Configuration
COPY nginx/nginx.conf               /etc/nginx/nginx.conf
COPY php-fpm/fpm.conf               /etc/service/php-fpm/fpm.conf
COPY php-fpm/capco.ini              /etc/php/7.0/fpm/conf.d/capco.ini
COPY php-fpm/capco.ini              /etc/php/7.0/cli/conf.d/capco.ini
COPY cron/crontab                   /etc/cron.d/crontab
COPY varnish/capco.vcl              /etc/varnish/capco.vcl
COPY rabbitmq/rabbitmq.config       /etc/rabbitmq/rabbitmq.config
COPY logrotate/mysql-slow-logs      /etc/logrotate.d/mysql-slow-logs
COPY supervisord/                   /etc/supervisord

# Volume for log / cache ...
VOLUME /var/www/var/cache
VOLUME /var/www/var/logs

WORKDIR /var/www

CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

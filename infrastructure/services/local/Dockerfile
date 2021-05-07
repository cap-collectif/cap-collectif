FROM debian:buster

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
        software-properties-common \
        runit \
        wget \
        libicu-dev \
        gnupg2 \
        ca-certificates \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install php
RUN wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg
RUN wget -O- https://packages.sury.org/php/apt.gpg | apt-key add - && \
    echo "deb https://packages.sury.org/php/ buster main" > /etc/apt/sources.list.d/php.list && \
    apt-get update && \
    apt-get install -y -qq \
        php-apcu \
        php7.4-apcu \
        php7.4-apc \
        php7.4-cli \
        php7.4-mbstring \
        php7.4-common \
        php7.4-curl \
        php7.4-dev \
        php7.4-fpm \
        php7.4-gd \
        php7.4-imagick \
        php7.4-intl \
        php7.4-json \
        php7.4-sqlite3 \
        php7.4-mysql \
        php7.4-opcache \
        php7.4-redis \
        php7.4-xsl \
        php7.4-zip \
        #php7.4-pcov \
        php7.4-amqp \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN echo "extension=apcu.so" > /etc/php/7.4/php.ini
RUN echo "apc.enable_cli=1" > /etc/php/7.4/php.ini
RUN echo "apc.enable=1" > /etc/php/7.4//php.ini

# Install nodejs and deps for npm install
ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_VERSION 8.12.0
RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

# Install blackfire PHP Probe
#RUN version=$(php -r "echo PHP_MAJOR_VERSION.PHP_MINOR_VERSION;") \
#    && architecture=$(case $(uname -m) in i386 | i686 | x86) echo "i386" ;; x86_64 | amd64) echo "amd64" ;; aarch64 | arm64 | armv8) echo "arm64" ;; *) echo "amd64" ;; esac) \
#    && curl -A "Docker" -o /tmp/blackfire-probe.tar.gz -D - -L -s https://blackfire.io/api/v1/releases/probe/php/linux/$architecture/$version \
#    && mkdir -p /tmp/blackfire \
#    && tar zxpf /tmp/blackfire-probe.tar.gz -C /tmp/blackfire \
#    && mv /tmp/blackfire/blackfire-*.so $(php -r "echo ini_get ('extension_dir');")/blackfire.so \
#    && printf "extension=blackfire.so\nblackfire.agent_socket=tcp://blackfire:8707\n" > $PHP_INI_DIR/conf.d/blackfire.ini \
#    && rm -rf /tmp/blackfire /tmp/blackfire-probe.tar.gz
#
#COPY blackfire/blackfire-agent.ini /etc/blackfire/agent
#COPY blackfire/blackfire-agent.ini /etc/php/7.4/fpm/conf.d/90-blackfire-agent.ini
#COPY blackfire/blackfire-agent.ini /etc/php/7.4/cli/conf.d/90-blackfire-agent.ini
#COPY blackfire/blackfire-php.ini /etc/php/7.4/fpm/conf.d/92-blackfire-config.ini
#COPY blackfire/blackfire-php.ini /etc/php/7.4/cli/conf.d/92-blackfire-config.ini

# Install RabbitMQ
RUN apt update -y && apt-get install curl gnupg debian-keyring debian-archive-keyring apt-transport-https -y && \
    tee /etc/apt/sources.list.d/rabbitmq.list <<EOF

## Team RabbitMQ's main signing key
RUN apt-key adv --keyserver "hkps://keys.openpgp.org" --recv-keys "0x0A9AF2115F4687BD29803A206B73A36E6026DFCA" && \
    apt-key adv --keyserver "keyserver.ubuntu.com" --recv-keys "F77F1EDA57EBB1CC"  && \
    apt-key adv --keyserver "keyserver.ubuntu.com" --recv-keys "F6609E60DC62814E" && \
    add-apt-repository 'deb http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu/ bionic main' && \
    add-apt-repository 'deb https://packagecloud.io/rabbitmq/rabbitmq-server/ubuntu/ bionic main'

## Install Erlang packages
RUN apt-get update -y && \
    apt-get install -y libssl1.1 erlang-base \
        erlang-asn1 erlang-crypto erlang-eldap erlang-ftp erlang-inets \
        erlang-mnesia erlang-os-mon erlang-parsetools erlang-public-key \
        erlang-runtime-tools erlang-snmp erlang-ssl \
        erlang-syntax-tools erlang-tftp erlang-tools erlang-xmerl

## Install rabbitmq-server and its dependencies
RUN apt-get install rabbitmq-server -y --fix-missing

RUN    rabbitmq-plugins enable rabbitmq_management

# Install nginx, mysql client and redis client
RUN apt-get update && \
    apt-get install -y -qq \
        sqlite \
        mariadb-client \
        redis-server \
        nginx \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


# Install varnish
RUN apt-get update -y && \
	    apt-get install -y build-essential automake libtool curl git python-docutils

RUN curl https://packagecloud.io/install/repositories/varnishcache/varnish66/script.deb.sh | /bin/bash && \
	    apt-get install -y varnish-dev && \
        git clone -b 0.18.0 https://github.com/varnish/varnish-modules.git /tmp/vm && \
	    cd /tmp/vm && \
	    ./bootstrap && \
	    ./configure && \
	    make && \
	    make install

# Install Supervisor
RUN apt-get update && \
    apt-get install -y supervisor && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install fake user 1000
RUN groupadd --gid=1000 capco && \
    /usr/sbin/useradd --system --uid 1000 --home /home/capco --shell /bin/bash --gid 1000 capco


#RedirectionIO
WORKDIR /usr/local/bin/
RUN wget https://packages.redirection.io/dist/redirectionio-agent-latest_any_amd64.tar.gz
RUN tar -xzvf redirectionio-agent-latest_any_amd64.tar.gz

# Binaries
COPY rabbitmq/rabbitmqadmin     /usr/local/bin/rabbitmqadmin

# Service
COPY nginx/run                  /etc/service/nginx/run
COPY php-fpm/run                /etc/service/php-fpm/run
COPY cron/run                   /etc/service/cron/run
COPY varnish/run                /etc/service/varnish/run
# COPY blackfire/run              /etc/service/blackfire/run
COPY rabbitmq/run               /etc/service/rabbitmq/run
COPY redirectionio/run          /etc/service/redirectionio/run
# COPY nodejs/run                 /etc/service/nodejs/run

# Configuration
COPY nginx/ssl/capco.crt            /etc/ssl/certs/capco.crt
COPY nginx/ssl/capco.key            /etc/ssl/private/capco.key
COPY nginx/ssl/capco.pem            /etc/ssl/certs/capco.pem
COPY nginx/nginx.conf               /etc/nginx/nginx.conf
COPY nginx/proxy.conf               /etc/nginx/proxy.conf
COPY nginx/fastcgi.conf             /etc/nginx/fastcgi.conf
COPY nginx/default_headers.conf     /etc/nginx/default_headers.conf
COPY nginx/fastcgi_forward.conf     /etc/nginx/fastcgi_forward.conf
COPY php-fpm/fpm.conf               /etc/service/php-fpm/fpm.conf
COPY php-fpm/capco.ini              /etc/php/7.4/fpm/conf.d/capco.ini
COPY php-fpm/capco.ini              /etc/php/7.4/cli/conf.d/capco.ini
COPY cron/crontab                   /etc/cron.d/crontab
COPY varnish/capco.vcl              /etc/varnish/capco.vcl
COPY rabbitmq/rabbitmq.config       /etc/rabbitmq/rabbitmq.config
COPY logrotate/mysql-slow-logs      /etc/logrotate.d/mysql-slow-logs
COPY supervisord/                   /etc/supervisord
COPY redirectionio/agent.yml        /etc/redirectionio/agent.yml

# Cache storage for rules
VOLUME /var/lib/redirectionio
# Volume for log / cache ...
VOLUME /var/www/var/cache
VOLUME /var/www/var/logs

WORKDIR /var/www

CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

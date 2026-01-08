# syntax=docker/dockerfile:1
FROM debian:bullseye AS base

ENV PHP_VERSION 8.1

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
        dnsutils \
        vim \
        htop

# Install php
RUN wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg
RUN wget -O- https://packages.sury.org/php/apt.gpg | apt-key add - && \
    echo "deb https://packages.sury.org/php/ bullseye main" > /etc/apt/sources.list.d/php.list && \
    apt-get update && \
    apt-get install -y -qq \
        php${PHP_VERSION}-apcu \
        php${PHP_VERSION}-cli \
        php${PHP_VERSION}-mbstring \
        php${PHP_VERSION}-common \
        php${PHP_VERSION}-curl \
        php${PHP_VERSION}-dev \
        php${PHP_VERSION}-fpm \
        php${PHP_VERSION}-gd \
        php${PHP_VERSION}-imagick \
        php${PHP_VERSION}-intl \
        php${PHP_VERSION}-sqlite3 \
        php${PHP_VERSION}-mysql \
        php${PHP_VERSION}-opcache \
        php${PHP_VERSION}-xsl \
        php${PHP_VERSION}-zip \
        php${PHP_VERSION}-amqp \
        php${PHP_VERSION}-simplexml \
        php-pear

# TODO This block needs to be removed after migrating to Symfony 6.4 and redis extension needs to be installed like the others above.
# ( Bug in symfony Cache component with redis version > 6.0.3: https://github.com/symfony/symfony/pull/57885 )
RUN pecl install redis-6.0.2

RUN <<EOF
echo "
extension='redis.so'
" >> /etc/php/${PHP_VERSION}/mods-available/redis.ini
EOF

RUN ln -s /etc/php/${PHP_VERSION}/mods-available/redis.ini /etc/php/${PHP_VERSION}/cli/conf.d/25-redis.ini \
    && ln -s /etc/php/${PHP_VERSION}/mods-available/redis.ini /etc/php/${PHP_VERSION}/fpm/conf.d/25-redis.ini
### end of block

RUN <<EOF
echo "
apc.enable_cli=1
apc.enable=1
" >> /etc/php/${PHP_VERSION}/mods-available/apcu.ini
EOF

RUN pecl install xdebug-3.1.0

RUN <<EOF
echo "
zend_extension=xdebug
xdebug.mode=debug
xdebug.discover_client_host=true
xdebug.client_host=host.docker.internal
xdebug.start_with_request=trigger
xdebug.cli_color=1
xdebug.force_display_errors=1
xdebug.force_error_reporting=1
" >> /etc/php/${PHP_VERSION}/mods-available/xdebug.ini
EOF

RUN ln -s /etc/php/${PHP_VERSION}/mods-available/xdebug.ini /etc/php/${PHP_VERSION}/cli/conf.d/20-xdebug.ini \
    && ln -s /etc/php/${PHP_VERSION}/mods-available/xdebug.ini /etc/php/${PHP_VERSION}/fpm/conf.d/20-xdebug.ini

RUN <<EOF
echo "
export LS_OPTIONS='--color=auto'
alias ls='ls \$LS_OPTIONS'
alias ll='ls \$LS_OPTIONS -l'
alias l='ls \$LS_OPTIONS -lA'
" >> /root/.bashrc
mkdir /home/capco/
chown capco: /home/capco/
cp /root/.bashrc /home/capco/
EOF


# NodeJS
ENV NODE_VERSION 20.19.6
RUN apt-get update \
  && apt-get install -y curl ca-certificates

RUN set -eux; \
  dpkgArch="$(dpkg --print-architecture)"; \
  case "${dpkgArch##*-}" in \
    amd64)   ARCH='x64' ;; \
    arm64)   ARCH='arm64' ;; \
    armhf)   ARCH='armv7l' ;; \
    i386)    ARCH='x86' ;; \
    ppc64el) ARCH='ppc64le' ;; \
    s390x)   ARCH='s390x' ;; \
    *) echo "Unsupported architecture: ${dpkgArch}"; exit 1 ;; \
  esac; \
  NODE_VERSION=20.19.6; \
  curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${ARCH}.tar.xz"; \
  curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt"; \
  grep " node-v${NODE_VERSION}-linux-${ARCH}.tar.xz\$" SHASUMS256.txt | sha256sum -c -; \
  tar -xJf "node-v${NODE_VERSION}-linux-${ARCH}.tar.xz" -C /usr/local --strip-components=1; \
  rm "node-v${NODE_VERSION}-linux-${ARCH}.tar.xz" SHASUMS256.txt; \
  node --version; \
  npm --version

ENV YARN_VERSION 1.22.10

RUN set -ex \
  && for key in \
    6A010C5166006599AA17F08146C2130DFD2497F5 \
  ; do \
    gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys "$key" || \
    gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key" ; \
  done \
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz.asc" \
  && gpg --batch --verify yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  && mkdir -p /opt \
  && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
  && rm yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  # smoke test
  && yarn --version

RUN yarn global add pm2

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
#COPY blackfire/blackfire-agent.ini /etc/php/${PHP_VERSION}/fpm/conf.d/90-blackfire-agent.ini
#COPY blackfire/blackfire-agent.ini /etc/php/${PHP_VERSION}/cli/conf.d/90-blackfire-agent.ini
#COPY blackfire/blackfire-php.ini /etc/php/${PHP_VERSION}/fpm/conf.d/92-blackfire-config.ini
#COPY blackfire/blackfire-php.ini /etc/php/${PHP_VERSION}/cli/conf.d/92-blackfire-config.ini

# Install RabbitMQ
RUN apt-get install curl gnupg debian-keyring debian-archive-keyring apt-transport-https -y && \
    tee /etc/apt/sources.list.d/rabbitmq.list

## Team RabbitMQ's main signing key
RUN apt-key adv --keyserver "hkps://keys.openpgp.org" --recv-keys "0x0A9AF2115F4687BD29803A206B73A36E6026DFCA" && \
    apt-key adv --keyserver "keyserver.ubuntu.com" --recv-keys "F77F1EDA57EBB1CC"  && \
    apt-key adv --keyserver "keyserver.ubuntu.com" --recv-keys "F6609E60DC62814E" && \
    add-apt-repository 'deb http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu/ bionic main' && \
    add-apt-repository 'deb https://packagecloud.io/rabbitmq/rabbitmq-server/ubuntu/ bionic main'

## Install rabbitmq-server and its dependencies
RUN apt-get install rabbitmq-server -y --fix-missing && \
    rabbitmq-plugins enable rabbitmq_management

# Install nginx, mysql client and redis client
RUN apt-get install -y -qq \
        sqlite3 \
        mariadb-client \
        redis-server \
        nginx

# Install varnish
RUN apt-get install -y varnish varnish-modules

# Install Supervisor
RUN apt-get install -y supervisor

# Clean apt cache to have a lighter image
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


# Install gosu binary (needs wget and ca-certificates).
ENV GOSU_VERSION 1.10
ENV SUPERVISORD_SWARROT_ES_INDEXATION_NUMPROCS=1
RUN set -ex; \
	dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')"; \
	wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch"; \
	wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc"; \
	chmod +x /usr/local/bin/gosu; \
    # verify that the binary works
	gosu nobody true

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
COPY nodejs/run                 /etc/service/nodejs/run

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
COPY php-fpm/capco.ini              /etc/php/${PHP_VERSION}/fpm/conf.d/capco.ini
COPY php-fpm/capco.ini              /etc/php/${PHP_VERSION}/cli/conf.d/capco.ini
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

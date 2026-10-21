# syntax=docker/dockerfile:1
FROM debian:bookworm AS base

ENV PHP_VERSION 8.1

# Install basic
RUN apt-get update && \
    apt-get install -y -qq --fix-missing \
        apt-transport-https \
        build-essential \
        cron \
        ffmpeg \
        curl \
        imagemagick \
        libmagickwand-dev \
        librabbitmq-dev \
        unzip \
        locales \
        pkg-config \
        runit \
        wget \
        libicu-dev \
        gnupg2 \
        dirmngr \
        ca-certificates \
        dnsutils \
        vim \
        htop

# Install php
RUN wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg
RUN wget -O- https://packages.sury.org/php/apt.gpg | apt-key add - && \
    echo "deb https://packages.sury.org/php/ bookworm main" > /etc/apt/sources.list.d/php.list && \
    apt-get update && \
    apt-get install -y -qq \
        php${PHP_VERSION}-cli \
        php${PHP_VERSION}-mbstring \
        php${PHP_VERSION}-common \
        php${PHP_VERSION}-curl \
        php${PHP_VERSION}-dev \
        php${PHP_VERSION}-fpm \
        php${PHP_VERSION}-gd \
        php${PHP_VERSION}-intl \
        php${PHP_VERSION}-sqlite3 \
        php${PHP_VERSION}-mysql \
        php${PHP_VERSION}-opcache \
        php${PHP_VERSION}-xsl \
        php${PHP_VERSION}-zip \
        php${PHP_VERSION}-simplexml

# Pin PIE and extension versions so rebuilds do not silently upgrade them.
RUN curl -fsSL --retry 3 https://github.com/php/pie/releases/download/1.5.2/pie.phar -o /usr/local/bin/pie \
    && echo "fe70c59738cf56ec00a818cf9cb9593da171aac86f5f1f859995b8839dfd2cc7  /usr/local/bin/pie" | sha256sum -c - \
    && chmod +x /usr/local/bin/pie

# Enable modules explicitly for both CLI and FPM through Debian's module registry.
RUN set -eux; \
    for package in apcu/apcu:5.1.28 php-amqp/php-amqp:2.2.0 imagick/imagick:3.8.1 phpredis/phpredis:6.1.0 xdebug/xdebug:3.5.3; do \
        php${PHP_VERSION} /usr/local/bin/pie install --no-interaction --no-cache \
            --with-php-config=/usr/bin/php-config${PHP_VERSION} --skip-enable-extension "$package"; \
    done; \
    for extension in apcu amqp imagick redis; do \
        echo "extension=${extension}.so" > /etc/php/${PHP_VERSION}/mods-available/${extension}.ini; \
    done; \
    phpenmod -v ${PHP_VERSION} -s ALL apcu amqp imagick redis

RUN <<EOF
echo "
apc.enable_cli=1
apc.enable=1
" >> /etc/php/${PHP_VERSION}/mods-available/apcu.ini
EOF

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

# Yarn is provided by corepack: the version is resolved at runtime from the
# "packageManager" field of the project package.json, so upgrading Yarn does
# not require rebuilding this image.
RUN corepack enable

RUN npm install -g pm2

# Install RabbitMQ.
# Team RabbitMQ's Debian Erlang repository only ships amd64 packages.
# For local arm64 builds we provision Erlang from Launchpad instead,
# while still installing rabbitmq-server from Team RabbitMQ's repository.
RUN set -eux; \
    dpkgArch="$(dpkg --print-architecture)"; \
    curl -1sLf "https://keys.openpgp.org/vks/v1/by-fingerprint/0A9AF2115F4687BD29803A206B73A36E6026DFCA" | gpg --dearmor | tee /usr/share/keyrings/com.rabbitmq.team.gpg > /dev/null; \
    if [ "$dpkgArch" = "arm64" ]; then \
        apt-key adv --keyserver "keyserver.ubuntu.com" --recv-keys "F77F1EDA57EBB1CC"; \
        apt-key adv --keyserver "keyserver.ubuntu.com" --recv-keys "F6609E60DC62814E"; \
        printf '%s\n' \
            '## Modern Erlang/OTP releases for arm64' \
            'deb http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu jammy main' \
            '' \
            '## Latest RabbitMQ releases' \
            'deb [signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-server/debian/bookworm bookworm main' \
            'deb [signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-server/debian/bookworm bookworm main' \
            > /etc/apt/sources.list.d/rabbitmq.list; \
        printf '%s\n' \
            'Package: erlang*' \
            'Pin: origin ppa.launchpad.net' \
            'Pin-Priority: 1001' \
            > /etc/apt/preferences.d/erlang; \
    else \
        printf '%s\n' \
            '## Modern Erlang/OTP releases' \
            'deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-erlang/debian/bookworm bookworm main' \
            'deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-erlang/debian/bookworm bookworm main' \
            '' \
            '## Latest RabbitMQ releases' \
            'deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb1.rabbitmq.com/rabbitmq-server/debian/bookworm bookworm main' \
            'deb [arch=amd64 signed-by=/usr/share/keyrings/com.rabbitmq.team.gpg] https://deb2.rabbitmq.com/rabbitmq-server/debian/bookworm bookworm main' \
            > /etc/apt/sources.list.d/rabbitmq.list; \
        printf '%s\n' \
            'Package: erlang*' \
            'Pin: origin RabbitMQ' \
            'Pin-Priority: 1001' \
            > /etc/apt/preferences.d/erlang; \
    fi; \
    apt-get update -y; \
    apt-get install -y \
        erlang-base \
        erlang-asn1 \
        erlang-crypto \
        erlang-eldap \
        erlang-ftp \
        erlang-inets \
        erlang-mnesia \
        erlang-os-mon \
        erlang-parsetools \
        erlang-public-key \
        erlang-runtime-tools \
        erlang-snmp \
        erlang-ssl \
        erlang-syntax-tools \
        erlang-tftp \
        erlang-tools \
        erlang-xmerl; \
    apt-get install rabbitmq-server -y --fix-missing; \
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

# Install Composer
RUN curl -o /tmp/composer-setup.php https://getcomposer.org/installer \
    && curl -o /tmp/composer-setup.sig https://composer.github.io/installer.sig \
    && php -r "if (hash('SHA384', file_get_contents('/tmp/composer-setup.php')) !== trim(file_get_contents('/tmp/composer-setup.sig'))) { unlink('/tmp/composer-setup.php'); echo 'Invalid installer' . PHP_EOL; exit(1); }" \
    && php /tmp/composer-setup.php --version=2.8.4 --no-ansi --install-dir=/usr/local/bin --filename=composer \
    && rm -f /tmp/composer-setup.*


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
    /usr/sbin/useradd --system --uid 1000 --create-home --home /home/capco --shell /bin/bash --gid 1000 capco && \
    install -o capco -g capco -m 644 /root/.bashrc /home/capco/.bashrc


#New Root certificates used by let's encrypt (useful at least for france-connect-v2) - Remove this hack when switching base image from Debian 11 to Debian 12
RUN wget https://letsencrypt.org/certs/isrg-root-x2.pem && mv isrg-root-x2.pem isrg-root-x2.crt && cp isrg-root-x2.crt /usr/local/share/ca-certificates/ && update-ca-certificates

# Service
COPY nginx/run                  /etc/service/nginx/run
COPY php-fpm/run                /etc/service/php-fpm/run
COPY cron/run                   /etc/service/cron/run
COPY varnish/run                /etc/service/varnish/run
COPY rabbitmq/run               /etc/service/rabbitmq/run
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

# Volume for log / cache ...
VOLUME /var/www/var/cache
VOLUME /var/www/var/logs
VOLUME /var/www/var/vocal-contributions

WORKDIR /var/www

CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

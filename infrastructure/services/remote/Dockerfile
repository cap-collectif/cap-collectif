FROM node:8-slim AS node

FROM debian:stretch AS base

LABEL maintainer "Cap collectif <tech@cap-collectif.com>"

# Install basic
RUN set -x \
    && DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y -qq --fix-missing --no-install-recommends \
        adduser \
        ca-certificates \
        apt-transport-https \
        build-essential \
        bzip2 \
        cron \
        curl \
        git \
        imagemagick \
        libmagickwand-dev \
        locales \
        pkg-config \
        runit \
        wget \
        libicu-dev \
        sqlite \
        software-properties-common \
        locales \
        gnupg2 \
        dirmngr \
    && \
    localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV LANG C.UTF-8

# Install php7
RUN wget -O- https://packages.sury.org/php/apt.gpg | apt-key add - && \
    echo "deb https://packages.sury.org/php/ stretch main" > /etc/apt/sources.list.d/php.list && \
    DEBIAN_FRONTEND=noninteractive apt-get update && \
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
        php7.1-mysql \
        php7.1-mcrypt \
        php7.1-sqlite3 \
        php7.1-opcache \
        php7.1-redis \
        php7.1-xml \
        php7.1-xsl \
        php7.1-zip \
        php-amqp \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install gosu binary (needs wget and ca-certificates).
ENV GOSU_VERSION 1.10
RUN set -ex; \
	dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')"; \
	wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch"; \
	wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc"; \
	chmod +x /usr/local/bin/gosu; \
    # verify that the binary works
	gosu nobody true

# Install fake user 1000
RUN addgroup --gid=1000 capco && \
    adduser --system --uid=1000 --home /home/capco --shell /bin/bash capco

# Install composer
RUN curl -o /tmp/composer-setup.php https://getcomposer.org/installer \
    && curl -o /tmp/composer-setup.sig https://composer.github.io/installer.sig \
    && php -r "if (hash('SHA384', file_get_contents('/tmp/composer-setup.php')) !== trim(file_get_contents('/tmp/composer-setup.sig'))) { unlink('/tmp/composer-setup.php'); echo 'Invalid installer' . PHP_EOL; exit(1); }" \
    && php /tmp/composer-setup.php --no-ansi --install-dir=/usr/local/bin --filename=composer --snapshot \
    && rm -f /tmp/composer-setup.*

# Parallel composer install
RUN gosu capco composer global require "hirak/prestissimo:^0.3" --prefer-dist --no-progress --no-suggest --classmap-authoritative

# Install nginx
RUN wget -O- https://nginx.org/keys/nginx_signing.key | apt-key add - && \
    echo "deb http://nginx.org/packages/mainline/debian/ stretch nginx" > /etc/apt/sources.list.d/nginx.list && \
    apt-get update && \
    apt-get install -y -qq --no-install-recommends \
        nginx \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install redis
RUN echo "deb http://packages.dotdeb.org stretch all" > /etc/apt/sources.list.d/dotdeb.list && \
    echo "deb-src http://packages.dotdeb.org stretch all" >> /etc/apt/sources.list.d/dotdeb.list && \
    wget http://www.dotdeb.org/dotdeb.gpg -O- -q | apt-key add - && \
    apt-get update && \
    apt-get install -y -qq --no-install-recommends \
        redis-server \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*&& \
    sed -i 's/^\(bind .*\)$/# \1/' /etc/redis/redis.conf && \
    sed -i 's/^\(daemonize .*\)$/# \1/' /etc/redis/redis.conf && \
    sed -i 's/^\(dir .*\)$/# \1\ndir \/data/' /etc/redis/redis.conf && \
    sed -i 's/^\(logfile .*\)$/# \1/' /etc/redis/redis.conf

# Install java
RUN apt-get update && apt-get install -y openjdk-8-jdk-headless net-tools && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install ES
ENV ES_VERSION 5.6.8
RUN cd / && \
    wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-$ES_VERSION.tar.gz && \
    tar -xzf elasticsearch-$ES_VERSION.tar.gz && \
    rm -f elasticsearch-$ES_VERSION.tar.gz && \
    mv /elasticsearch-$ES_VERSION /etc/elasticsearch
RUN /etc/elasticsearch/bin/elasticsearch-plugin install --batch analysis-icu

# Install rabbitmq
ENV RABBITMQ_VERSION_DEB=3.6.16-2
RUN echo 'deb https://dl.bintray.com/rabbitmq/debian stretch main erlang-20.x' | tee /etc/apt/sources.list.d/bintray.rabbitmq.list && \
    wget -O- https://github.com/rabbitmq/signing-keys/releases/download/2.0/rabbitmq-release-signing-key.asc | apt-key add - && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y rabbitmq-server=$RABBITMQ_VERSION_DEB && \
    rm -rf /var/lib/apt/lists/* && \
    rabbitmq-plugins enable rabbitmq_management

# Install mariadb
RUN set -x \
    && apt-key adv --recv-keys --no-tty --keyserver keyserver.ubuntu.com 0xF1656F24C74CD1D8 \
    && add-apt-repository 'deb [arch=amd64,i386,ppc64el] http://mariadb.mirrors.ovh.net/MariaDB/repo/10.1/debian stretch main' \
    && apt-get update \
    && DEBIAN_FRONTEND=noninteractive apt-get install mariadb-server -y -qq \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install varnish
RUN apt-get update && cd /tmp \
    && wget --content-disposition https://packagecloud.io/varnishcache/varnish41/packages/debian/stretch/varnish_4.1.10-1~stretch_amd64.deb/download.deb \
    && dpkg -i varnish_4.1.10-1~stretch_amd64.deb \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install Supervisor
RUN apt-get update && \
    apt-get install -y python-pip python-setuptools --no-install-recommends && \
    easy_install supervisor && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Move mysql elsewhere because /var/lib/mysql will be a volume after build (see mysql/run)
RUN mv /var/lib/mysql /var/lib/mysql_save

# Service
COPY infrastructure/services/remote/mysql/run                  /etc/service/mysql/run
COPY infrastructure/services/remote/nginx/run                  /etc/service/nginx/run
COPY infrastructure/services/remote/redis/run                  /etc/service/redis/run
COPY infrastructure/services/remote/cron/run                   /etc/service/cron/run
COPY infrastructure/services/remote/elasticsearch/run          /etc/service/elasticsearch/run
COPY infrastructure/services/remote/varnish/run                /etc/service/varnish/run
COPY infrastructure/services/remote/rabbitmq/run               /etc/service/rabbitmq/run
#COPY infrastructure/services/remote/nodejs/run                 /etc/service/nodejs/run
COPY infrastructure/services/remote/supervisord/run            /etc/service/supervisord/run
COPY infrastructure/services/remote/php-fpm/run                /etc/service/php-fpm/run

# Configuration
COPY infrastructure/services/remote/mysql/capco.cnf                /etc/mysql/conf.d/capco.cnf
COPY infrastructure/services/remote/nginx/nginx.conf               /etc/nginx/nginx.conf
COPY infrastructure/services/remote/php-fpm/capco.ini              /etc/php/7.1/fpm/conf.d/capco.ini
COPY infrastructure/services/remote/php-fpm/capco.ini              /etc/php/7.1/cli/conf.d/capco.ini
COPY infrastructure/services/remote/php-fpm/fpm.conf               /etc/service/php-fpm/fpm.conf
COPY infrastructure/services/remote/cron/crontab                   /etc/cron.d/crontab
COPY infrastructure/services/remote/elasticsearch/capco.yml        /etc/elasticsearch/config/elasticsearch.yml
COPY infrastructure/services/remote/varnish/capco.vcl              /etc/varnish/capco.vcl
COPY infrastructure/services/remote/rabbitmq/rabbitmq.config         /etc/rabbitmq/rabbitmq.config
COPY infrastructure/services/remote/logrotate/mysql-slow-logs      /etc/logrotate.d/mysql-slow-logs
COPY infrastructure/services/remote/supervisord/                   /etc/supervisord

# Binaries
COPY infrastructure/services/remote/rabbitmq/rabbitmqadmin     /usr/local/bin/rabbitmqadmin

# Daemons
COPY infrastructure/services/remote/php-fpm/populate_elasticsearch_index /etc/service/php-fpm/populate_elasticsearch_index

ENV SYMFONY_ENVIRONMENT prod
ENV SYMFONY_DEBUG false

# make pam_loginuid.so optional for cron
# see https://github.com/docker/docker/issues/5663#issuecomment-42550548
RUN sed --regexp-extended --in-place \
    's/^session\s+required\s+pam_loginuid.so$/session optional pam_loginuid.so/' \
    /etc/pam.d/cron

# Create Working dir with good rights
RUN mkdir -p /var/www \
    && chown capco:capco /var/www \
    && chmod 0644 /etc/cron.d/crontab \
    && find /etc/service/ -name "run" -exec chmod +x {} \;

WORKDIR /var/www

# NodeJS and Yarn
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/include/node /usr/local/include/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/bin/node /usr/local/bin/nodejs && \
    ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

ENV YARN_VERSION 1.12.1
RUN curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
    && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
    && rm yarn-v$YARN_VERSION.tar.gz

# Download PHP dependencies
COPY composer.json composer.lock /var/www/
RUN gosu capco composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --ignore-platform-reqs --no-progress --apcu-autoloader

# Then add source code, build autoloader and initialize Symfony (including creating bootstrap.php.cache).
COPY . /var/www
RUN chown -R capco:capco . \
    && mkdir -p var/cache/prod \
    && chown -R capco:capco var \
    && chmod -R 777 var \
    && gosu capco composer dump-autoload --no-dev --optimize \
    && gosu capco php vendor/sensio/distribution-bundle/Resources/bin/build_bootstrap.php var \
    && rm -rf vendor/simplesamlphp/simplesamlphp/config/* \
    && rm -rf vendor/simplesamlphp/simplesamlphp/metadata/* \
    && rm -rf vendor/simplesamlphp/simplesamlphp/cert \
    && cp -r app/config/simplesamlphp /var/www/vendor/simplesamlphp \
    && gosu capco php -d memory_limit=-1 bin/console cache:warmup --env=$SYMFONY_ENVIRONMENT --no-interaction \
    && gosu capco php bin/console assets:install --symlink --env=${SYMFONY_ENVIRONMENT} --no-interaction

# Build JS
RUN yarn global add bower@1.8.4 babel-cli \
    && gosu capco yarn install --pure-lockfile \
    && gosu capco bower install --config.interactive=false \
    && gosu capco npm rebuild node-sass > /dev/null \
    && gosu capco php bin/console translation:download --env=prod \
    && gosu capco yarn run update-js-translation \
    && gosu capco yarn run relay \
    ## SSR is disabled
    #&& gosu capco yarn run build-server-bundle:prod \
    && gosu capco yarn run build:prod \
    ## Clean everything not needed
    && gosu capco yarn cache clean \
    && rm -rf node_modules bower_components

CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

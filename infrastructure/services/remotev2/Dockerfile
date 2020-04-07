FROM node:11-slim AS node

FROM debian:stretch AS base

LABEL maintainer "Cap collectif <tech@cap-collectif.com>"

ARG APP_VERSION="latest"

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
        php7.4-mysql \
        php7.4-opcache \
        php7.4-redis \
        php7.4-xsl \
        php7.4-zip \
        php7.4-xml \
        php-sqlite3\
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
# RUN gosu capco composer global require hirak/prestissimo --prefer-dist --no-progress --classmap-authoritative

# Install nginx
RUN wget -O- https://nginx.org/keys/nginx_signing.key | apt-key add - && \
    echo "deb http://nginx.org/packages/mainline/debian/ stretch nginx" > /etc/apt/sources.list.d/nginx.list && \
    apt-get update && \
    apt-get install -y -qq --no-install-recommends \
        nginx \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install java
RUN apt-get update && apt-get install -y openjdk-8-jdk-headless net-tools && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install varnish
RUN apt-get update -y && \
	    apt-get install -y build-essential automake libtool curl git python-docutils && \
	    curl -s https://packagecloud.io/install/repositories/varnishcache/varnish60/script.deb.sh | bash && \
	    apt-get install -y varnish-dev && \
	    git clone https://github.com/varnish/varnish-modules.git /tmp/vm && \
	    cd /tmp/vm && \
	    # Varnish dev team are currently working on a new version for varnish-modules on master branch.
	    # This commit is a reference to before the starting of varnish dev team's work.
	    git checkout 0d555b627333cd9190a40870f380ace5664f6d0d && \
	    ./bootstrap && \
	    ./configure && \
	    make && \
	    make install

# NewRelic PHP Probe
RUN wget -O - https://download.newrelic.com/548C16BF.gpg | apt-key add - && \
    echo 'deb http://apt.newrelic.com/debian/ newrelic non-free' | tee /etc/apt/sources.list.d/newrelic.list && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install newrelic-php5 -y --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Service
COPY infrastructure/services/remotev2/nginx/run                  /etc/service/nginx/run
COPY infrastructure/services/remotev2/varnish/run                /etc/service/varnish/run
COPY infrastructure/services/remotev2/php-fpm/run                /etc/service/php-fpm/run

# Configuration
COPY infrastructure/services/remotev2/nginx/nginx.conf               /etc/nginx/nginx.conf
COPY infrastructure/services/remotev2/php-fpm/capco.ini              /etc/php/7.4/fpm/conf.d/capco.ini
COPY infrastructure/services/remotev2/php-fpm/capco.ini              /etc/php/7.4/cli/conf.d/capco.ini
COPY infrastructure/services/remotev2/php-fpm/fpm.conf               /etc/service/php-fpm/fpm.conf
COPY infrastructure/services/remotev2/varnish/capco.vcl              /etc/varnish/capco.vcl

ENV SYMFONY_ENVIRONMENT prod
ENV SYMFONY_DEBUG false
ENV SYMFONY_APP_VERSION=$APP_VERSION

# Create Working dir with good rights
RUN mkdir -p /var/www \
    && chown capco:capco /var/www \
    && find /etc/service/ -name "run" -exec chmod +x {} \;

WORKDIR /var/www

# NodeJS and Yarn
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/include/node /usr/local/include/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -s /usr/local/bin/node /usr/local/bin/nodejs && \
    ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm

ENV YARN_VERSION 1.16.0
RUN curl -fSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
    && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
    && ln -snf /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
    && rm yarn-v$YARN_VERSION.tar.gz

# Download PHP dependencies
COPY composer.json composer.lock ./

# Will only install bundles that have changed since building the base image
RUN gosu capco composer install --no-dev --prefer-dist --no-interaction --ignore-platform-reqs --no-progress

# Then add usefull source code
COPY bin /var/www/bin
COPY translations /var/www/translations
COPY public /var/www/public
COPY app /var/www/app
COPY src /var/www/src
COPY assets /var/www/assets
COPY frontend /var/www/frontend
COPY templates /var/www/templates
COPY config /var/www/config
COPY fixtures /var/www/fixtures

# Maybe chown before copy will be faster
RUN mkdir -m 755 -p translations var public/media public/bundles src/Capco/AppBundle/GraphQL/__generated__ \
    && chown -R capco:capco . \
    && mkdir -p var/cache/prod \
    && chown -R capco:capco var \
    && chmod -R 777 var

# /!\
# /!\ Beyond this step nothing is cached /!\
# /!\

# Build autoloader and initialize Symfony
RUN rm -rf vendor/simplesamlphp/simplesamlphp/config/* \
    && rm -rf vendor/simplesamlphp/simplesamlphp/metadata/* \
    && rm -rf vendor/simplesamlphp/simplesamlphp/cert \
    && cp -r app/config/simplesamlphp /var/www/vendor/simplesamlphp \
    && gosu capco php bin/console graphql:compile --env=${SYMFONY_ENVIRONMENT} \
    && gosu capco composer dump-autoload --no-dev --optimize --apcu \
    && gosu capco php -d memory_limit=-1 bin/console cache:warmup --env=$SYMFONY_ENVIRONMENT --no-interaction \
    && gosu capco php bin/console assets:install public --symlink --env=${SYMFONY_ENVIRONMENT} --no-interaction

CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

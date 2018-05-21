FROM node:8-slim AS node

FROM composer:latest AS composer

FROM php:7.1-cli AS php

LABEL maintainer "Cap Collectif <tech@cap-collectif.com>"

ENV COMPOSER_ALLOW_SUPERUSER 1

ENV YARN_VERSION 1.6.0
COPY --from=composer /usr/bin/composer /usr/bin/composer
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/include/node /usr/local/include/node
COPY --from=node /usr/local/lib/node_modules /usr/local/lib/node_modules
COPY --from=node /opt/yarn-$YARN_VERSION /opt/yarn
RUN ln -s /usr/local/bin/node /usr/local/bin/nodejs && \
    ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm && \
    ln -s /opt/yarn/bin/yarn /usr/local/bin/yarn

RUN apt-get update && \
    apt-get install -y libcurl4-openssl-dev \
      libmcrypt-dev \
      libmcrypt4 \
      zlib1g-dev \
      libicu-dev \
      libpcre3-dev \
      libfreetype6-dev \
      libpcre3-dev \
      libxml2-dev \
      libxslt-dev \
      libpng-dev \
      libmagickwand-dev \
      zip unzip git vim ssmtp wget && \
    pecl install redis-3.1.6 && \
    docker-php-ext-enable redis && \
    pecl install imagick && \
    docker-php-ext-enable imagick && \
    pecl install apcu && \
    docker-php-ext-enable apcu && \
    docker-php-ext-configure gd --with-gd --with-freetype-dir=/usr/include/ --with-jpeg-dir=/usr/include/ --with-png-dir=/usr/include/ && \
	docker-php-ext-configure intl && \
    docker-php-ext-install -j$(nproc) curl mbstring intl mysqli dom zip gd xsl && \
    rm -r /var/lib/apt/lists/*

# Install bower and babel-cli
RUN yarn global add bower@1.8.0 babel-cli

COPY capco.ini /usr/local/etc/php/conf.d/capco.ini
COPY build.sh /usr/local/bin/build

RUN composer global require "hirak/prestissimo:^0.3" --prefer-dist --no-progress --no-suggest --classmap-authoritative

RUN chmod +x /usr/local/bin/build

WORKDIR /var/www

CMD ["/usr/local/bin/build"]

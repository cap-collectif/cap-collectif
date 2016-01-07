FROM php:5.6-cli

MAINTAINER Aurélien David <adavid@jolicode.com>

RUN docker-php-ext-install mbstring

RUN apt-get update && \
    apt-get install -y git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

COPY php.ini /usr/local/etc/php/php.ini

ADD composer.json /home/behat/composer/composer.json
RUN cd /home/behat/composer && curl http://getcomposer.org/installer | php
RUN cd /home/behat/composer && php composer.phar install --prefer-source

WORKDIR /var/www/html

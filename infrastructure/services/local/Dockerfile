FROM debian:jessie

MAINTAINER Aurélien David <adavid@jolicode.com>

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
RUN echo "deb http://packages.dotdeb.org jessie all" > /etc/apt/sources.list.d/dotdeb.list && \
    echo "deb-src http://packages.dotdeb.org jessie all" >> /etc/apt/sources.list.d/dotdeb.list && \
    wget http://www.dotdeb.org/dotdeb.gpg -O- -q | apt-key add - && \
    apt-get update && \
    apt-get install -y -qq \
        php7.0-apcu \
        php7.0-apc \
        php7.0-cli \
        php7.0-common \
        php7.0-curl \
        php7.0-dev \
        php7.0-fpm \
        php7.0-gd \
        php7.0-imagick \
        php7.0-intl \
        php7.0-json \
        php7.0-mysql \
        php7.0-opcache \
        php7.0-redis \
        php7.0-xsl \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install recent v8, phpv8js
RUN apt-get update && \
    apt-get upgrade -y && \
    apt-get install -y vim git git-svn subversion make g++ libreadline-dev && \
    git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git /usr/local/depot_tools && \
    export PATH=/usr/local/depot_tools:$PATH && \
    cd /tmp && \
    rm -rf /tmp/* && \
    fetch --nohooks v8 && \
    cd v8 && \
    git checkout 4.9.385.28 && \
    gclient sync --nohooks && \
    export GYP_DEFINES="use_system_icu=1" && \
    export GYPFLAGS="-Dv8_use_external_startup_data=0 -Dclang=0" && \
    make native library=shared snapshot=on -j4 && \
    cp out/native/lib.target/lib*.so /usr/lib/ && \
    cp out/native/obj.target/tools/gyp/libv8_libplatform.a /usr/lib && \
    cp -R include/* /usr/include && \
    git clone https://github.com/phpv8/v8js.git --branch 1.1.0 /tmp/v8js && \
    cd /tmp/v8js && phpize && ./configure && \
    make all test install && \
    cd / && \
    rm -rf /tmp/* /usr/local/depot_tools && \
    apt-get purge -y vim git git-svn subversion make g++ libreadline-dev && \
    apt-get autoremove -y && \
    apt-get clean all

# Install blackfire PHP Probe
RUN version=$(php -r "echo PHP_MAJOR_VERSION.PHP_MINOR_VERSION;") \
    && curl -A "Docker" -o /tmp/blackfire-probe.tar.gz -D - -L -s https://blackfire.io/api/v1/releases/probe/php/linux/amd64/$version \
    && tar zxpf /tmp/blackfire-probe.tar.gz -C /tmp \
    && mv /tmp/blackfire-*.so $(php -r "echo ini_get('extension_dir');")/blackfire.so \
    && echo -e "extension=blackfire.so\nblackfire.agent_socket=tcp://blackfire:8707" > /etc/php/7.0/fpm/conf.d/blackfire.ini

# Install nginx, mysql client and redis client
RUN apt-get update && \
    apt-get install -y -qq \
        mysql-client \
        redis-tools \
        nginx \
    && \
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
COPY php-fpm/capco.ini          /etc/php/7.0/fpm/conf.d/capco.ini
COPY php-fpm/capco.ini          /etc/php/7.0/cli/conf.d/capco.ini
COPY cron/crontab               /etc/cron.d/crontab
COPY varnish/capco.vcl          /etc/varnish/capco.vcl

# Volume for log / cache ...
VOLUME /var/www/var/cache
VOLUME /var/www/var/logs

WORKDIR /var/www

CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

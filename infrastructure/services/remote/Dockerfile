FROM debian:jessie

MAINTAINER Aurélien David <adavid@jolicode.com>

RUN sed -i 's/httpredir.debian.org/debian.mirrors.ovh.net/g' /etc/apt/sources.list

# Install basic
RUN apt-get update && \
    apt-get install -y -qq --fix-missing \
        adduser \
        apt-transport-https \
        build-essential \
        bzip2 \
        cron \
        curl \
        imagemagick \
        libmagickwand-dev \
        locales \
        pkg-config \
        runit \
        wget \
        libicu-dev \
        sqlite \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install php7
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
        php7.0-mcrypt \
        php7.0-mysql \
        php7.0-sqlite3 \
        php7.0-opcache \
        php7.0-redis \
        php7.0-xml \
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

# Install mariadb
RUN apt-key adv --keyserver ha.pool.sks-keyservers.net --recv-keys 199369E5404BD5FC7D2FE43BCBCB082A1BB943DB && \
    apt-key adv --keyserver ha.pool.sks-keyservers.net --recv-keys 430BDF5C56E7C94E848EE60C1C4CBDCDCD2EFD2A && \
    apt-key adv --keyserver ha.pool.sks-keyservers.net --recv-keys 4D1BB29D63D98E422B2113B19334A25F8507EFA5 && \
    echo "deb http://ftp.osuosl.org/pub/mariadb/repo/10.1/debian jessie main" >> /etc/apt/sources.list \
    && { \
		    echo 'Package: *'; \
		    echo 'Pin: release o=MariaDB'; \
		    echo 'Pin-Priority: 999'; \
	  } > /etc/apt/preferences.d/mariadb && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get -y install \
        mariadb-server=10.1.30+maria-1~jessie \
        mariadb-client=10.1.30+maria-1~jessie \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install nginx
RUN apt-get update && \
    apt-get install -y -qq \
        nginx \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install redis
RUN echo "deb http://packages.dotdeb.org jessie all" > /etc/apt/sources.list.d/dotdeb.list && \
    echo "deb-src http://packages.dotdeb.org jessie all" >> /etc/apt/sources.list.d/dotdeb.list && \
    wget http://www.dotdeb.org/dotdeb.gpg -O- -q | apt-key add - && \
    apt-get update && \
    apt-get install -y -qq \
        redis-server \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*&& \
    sed -i 's/^\(bind .*\)$/# \1/' /etc/redis/redis.conf && \
    sed -i 's/^\(daemonize .*\)$/# \1/' /etc/redis/redis.conf && \
    sed -i 's/^\(dir .*\)$/# \1\ndir \/data/' /etc/redis/redis.conf && \
    sed -i 's/^\(logfile .*\)$/# \1/' /etc/redis/redis.conf

# Install java
RUN echo "deb http://ppa.launchpad.net/webupd8team/java/ubuntu trusty main" | tee /etc/apt/sources.list.d/webupd8team-java.list  && \
    echo "deb-src http://ppa.launchpad.net/webupd8team/java/ubuntu trusty main" | tee -a /etc/apt/sources.list.d/webupd8team-java.list  && \
    apt-key adv --keyserver keyserver.ubuntu.com --recv-keys EEA14886  && \
    apt-get update  && \
    echo debconf shared/accepted-oracle-license-v1-1 select true | debconf-set-selections  && \
    echo debconf shared/accepted-oracle-license-v1-1 seen true | debconf-set-selections  && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --force-yes \
        oracle-java8-installer \
        oracle-java8-set-default \
    && \
    rm -rf /var/cache/oracle-jdk8-installer  && \
    apt-get clean  && \
    rm -rf /var/lib/apt/lists/*

# Install ES
RUN cd / && \
    wget https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.7.3.tar.gz && \
    tar xvzf elasticsearch-1.7.3.tar.gz && \
    rm -f elasticsearch-1.7.3.tar.gz && \
    mv /elasticsearch-1.7.3 /etc/elasticsearch

# Install rabbitmq
RUN echo 'deb http://www.rabbitmq.com/debian/ testing main' >> /etc/apt/sources.list.d/rabbitmq.list && \
    wget -O- https://www.rabbitmq.com/rabbitmq-release-signing-key.asc | apt-key add - && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y rabbitmq-server && \
    rm -rf /var/lib/apt/lists/* && \
    rabbitmq-plugins enable rabbitmq_management

# Install New Relic Agent
RUN echo "deb http://apt.newrelic.com/debian/ newrelic non-free" >> /etc/apt/sources.list.d/newrelic.list && \
    wget -O - https://download.newrelic.com/548C16BF.gpg | apt-key add - && \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y newrelic-php5 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /etc/apt/sources.list.d/* && \
    newrelic-install install

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
RUN addgroup --gid=1000 capco && \
    adduser --system --uid=1000 --home /home/capco --shell /bin/bash capco

# Move mysql elsewhere because /var/lib/mysql will be a volume after build (see mysql/run)
RUN mv /var/lib/mysql /var/lib/mysql_save

# Service
COPY mysql/run                  /etc/service/mysql/run
COPY nginx/run                  /etc/service/nginx/run
COPY php-fpm/run                /etc/service/php-fpm/run
COPY redis/run                  /etc/service/redis/run
COPY cron/run                   /etc/service/cron/run
COPY elasticsearch/run          /etc/service/elasticsearch/run
COPY varnish/run                /etc/service/varnish/run
COPY rabbitmq/run               /etc/service/rabbitmq/run
COPY nodejs/run                 /etc/service/nodejs/run
COPY supervisord/run            /etc/service/supervisord/run

# Configuration
COPY mysql/capco.cnf                /etc/mysql/conf.d/capco.cnf
COPY nginx/nginx.conf               /etc/nginx/nginx.conf
COPY php-fpm/fpm.conf               /etc/service/php-fpm/fpm.conf
COPY php-fpm/capco.ini              /etc/php/7.0/fpm/conf.d/capco.ini
COPY php-fpm/capco.ini              /etc/php/7.0/cli/conf.d/capco.ini
COPY cron/crontab                   /etc/cron.d/crontab
COPY elasticsearch/capco.yml        /etc/elasticsearch/config/elasticsearch.yml
COPY varnish/capco.vcl              /etc/varnish/capco.vcl
COPY rabbitmq/rabbitmq.config       /etc/rabbitmq/rabbitmq.config
COPY logrotate/mysql-slow-logs      /etc/logrotate.d/mysql-slow-logs
COPY supervisord/                   /etc/supervisord

# Binaries
COPY rabbitmq/rabbitmqadmin     /usr/local/bin/rabbitmqadmin

# Daemons
COPY php-fpm/populate_elasticsearch_index /etc/service/php-fpm/populate_elasticsearch_index

WORKDIR /var/www
USER root

# Default command
CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

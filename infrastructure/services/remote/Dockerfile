FROM debian:jessie

MAINTAINER Aurélien David <adavid@jolicode.com>

# Install basic
RUN apt-get update && \
    apt-get install -y -qq \
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
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install php7
RUN echo "deb http://packages.dotdeb.org jessie all" > /etc/apt/sources.list.d/dotdeb.list && \
    echo "deb-src http://packages.dotdeb.org jessie all" >> /etc/apt/sources.list.d/dotdeb.list && \
    wget http://www.dotdeb.org/dotdeb.gpg -O- -q | apt-key add - && \
    apt-get update && \
    apt-get install -y -qq \
        php7.0-apcu \
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

# Install mariadb
RUN apt-key adv --recv-keys --keyserver hkp://keyserver.ubuntu.com:80 0xcbcb082a1bb943db && \
    echo "deb http://ftp.osuosl.org/pub/mariadb/repo/10.1/debian jessie main" >> /etc/apt/sources.list && \
    apt-get update -qq && \
    DEBIAN_FRONTEND=noninteractive apt-get -y install \
        mariadb-server-10.1=10.1.12+maria-1~jessie \
        mariadb-client-10.1=10.1.12+maria-1~jessie \
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
    apt-get install -y wget apt-transport-https && \
    wget https://repo.varnish-cache.org/debian/GPG-key.txt -O- -q | apt-key add - && \
    echo "deb https://repo.varnish-cache.org/debian/ jessie varnish-4.0" >> /etc/apt/sources.list.d/varnish-cache.list && \
    apt-get update && \
    apt-get install -y varnish && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install fake user 1000
RUN addgroup --gid=1000 capco && \
    adduser --system --uid=1000 --home /home/capco --shell /bin/bash capco

# Move mysql elsewhere because /var/lib/mysql will be a volume after build (see mysql/run)
RUN mv /var/lib/mysql /var/lib/mysql_save

# Generate a new docker image even if dockerfiles has not changed
COPY VERSION /VERSION

# Service
COPY mysql/run                  /etc/service/mysql/run
COPY nginx/run                  /etc/service/nginx/run
COPY php-fpm/run                /etc/service/php-fpm/run
COPY redis/run                  /etc/service/redis/run
COPY cron/run                   /etc/service/cron/run
COPY elasticsearch/run          /etc/service/elasticsearch/run
COPY varnish/run                /etc/service/varnish/run

# Configuration
COPY mysql/capco.cnf            /etc/mysql/conf.d/capco.cnf
COPY nginx/nginx.conf           /etc/nginx/nginx.conf
COPY php-fpm/fpm.conf           /etc/service/php-fpm/fpm.conf
COPY php-fpm/capco.ini          /etc/php/7.0/fpm/conf.d/capco.ini
COPY php-fpm/capco.ini          /etc/php/7.0/cli/conf.d/capco.ini
COPY cron/crontab               /etc/cron.d/crontab
COPY elasticsearch/capco.yml    /etc/elasticsearch/config/elasticsearch.yml
COPY varnish/capco.vcl          /etc/varnish/capco.vcl

# Daemons
COPY php-fpm/populate_elasticsearch_index /etc/service/php-fpm/populate_elasticsearch_index

WORKDIR /var/www
USER root

# Default command
CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

FROM debian:wheezy

MAINTAINER Bastien Jaillot <bjaillot@jolicode.com>

# Install basic
RUN apt-get update && \
    apt-get install -y wget runit locales adduser wget bzip2 git && \

    # Install nginx, mariadb and php (fpm)
    echo "deb http://packages.dotdeb.org wheezy all" > /etc/apt/sources.list.d/dotdeb.list && \
    echo "deb http://packages.dotdeb.org wheezy-php56 all" >> /etc/apt/sources.list.d/dotdeb.list && \
    echo "deb http://ftp.igh.cnrs.fr/pub/mariadb/repo/10.0/debian wheezy main" >> /etc/apt/sources.list.d/dotdeb.list && \
    apt-key adv --recv-keys --keyserver keyserver.ubuntu.com 0xcbcb082a1bb943db && \
    wget http://www.dotdeb.org/dotdeb.gpg -O- -q | apt-key add - && \
    apt-get update && \
    apt-get install -y -qq curl imagemagick cron nginx php5-fpm php5-cli php5-curl php5-intl php5-mysqli php5-redis php5-xsl php5-gd php5-imagick mariadb-server redis-server && \

    # Configure Redis
    sed -i 's/^\(bind .*\)$/# \1/' /etc/redis/redis.conf && \
    sed -i 's/^\(daemonize .*\)$/# \1/' /etc/redis/redis.conf && \
    sed -i 's/^\(dir .*\)$/# \1\ndir \/data/' /etc/redis/redis.conf && \
    sed -i 's/^\(logfile .*\)$/# \1/' /etc/redis/redis.conf && \

    # Install node js and deps for npm install
    wget https://deb.nodesource.com/setup -O- -q | bash - && \
    apt-get install -y nodejs npm && \

    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install java
RUN \
  echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | debconf-set-selections && \
  echo "deb http://ppa.launchpad.net/webupd8team/java/ubuntu trusty main" | tee /etc/apt/sources.list.d/webupd8team-java.list && \
  echo "deb-src http://ppa.launchpad.net/webupd8team/java/ubuntu trusty main" | tee -a /etc/apt/sources.list.d/webupd8team-java.list && \
  apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys EEA14886 && \
  apt-get update && \
  apt-get install  -y -qq --no-install-recommends oracle-java8-installer && \
  rm -rf /var/lib/apt/lists/* && \
  rm -rf /var/cache/oracle-jdk8-installer

# Define commonly used JAVA_HOME variable
ENV JAVA_HOME /usr/lib/jvm/java-8-oracle

# Install elasticsearch.
ENV ES_PKG_NAME elasticsearch-1.7.0
RUN \
  cd / && \
  wget https://download.elasticsearch.org/elasticsearch/elasticsearch/$ES_PKG_NAME.tar.gz && \
  tar xvzf $ES_PKG_NAME.tar.gz && \
  rm -f $ES_PKG_NAME.tar.gz && \
  mv /$ES_PKG_NAME /etc/elasticsearch

# Install New Relic Agent
RUN \
    echo "deb http://apt.newrelic.com/debian/ newrelic non-free" >> /etc/apt/sources.list.d/newrelic.list && \
    wget -O - https://download.newrelic.com/548C16BF.gpg | apt-key add - && \
    apt-get update && \
    apt-get install -y newrelic-php5 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* /etc/apt/sources.list.d/* && \
    rm -f /etc/php5/*/conf.d/newrelic.ini

# Install varnish
RUN apt-get update && \
    apt-get install -y wget apt-transport-https && \
    wget https://repo.varnish-cache.org/debian/GPG-key.txt -O- -q | apt-key add - && \
    echo "deb https://repo.varnish-cache.org/debian/ wheezy varnish-4.0" >> /etc/apt/sources.list.d/varnish-cache.list && \
    apt-get update && \
    apt-get install -y varnish && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install fake user 1000
RUN addgroup --gid=1000 capco && \
    adduser --system --uid=1000 --home /home/capco --shell /bin/bash capco

# Prepare /var/www
RUN rm -rf /var/www/html; chown -R capco:capco /var/www/

# Move mysql elsewhere because /var/lib/mysql will be a volume after build (see mysql/run)
RUN mv /var/lib/mysql /var/lib/mysql_save

COPY entrypoint.sh /entrypoint.sh

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
COPY php-fpm/capco.ini          /etc/php5/fpm/conf.d/capco.ini
COPY php-fpm/capco.ini          /etc/php5/cli/conf.d/capco.ini
COPY cron/crontab               /etc/cron.d/crontab
COPY elasticsearch/capco.yml    /etc/elasticsearch/config/elasticsearch.yml
COPY varnish/capco.vcl          /etc/varnish/capco.vcl

# Generate a new docker image even if dockerfiles has not changed
COPY VERSION /VERSION

# Volume for redis
VOLUME ["/data"]

# Add entrypoint
WORKDIR /var/www
ENTRYPOINT ["/entrypoint.sh"]

USER root

# Default command
CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

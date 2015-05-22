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
    apt-get install -y -qq nginx php5-fpm php5-cli php5-curl php5-intl php5-mysqli php5-redis php5-xsl php5-gd mariadb-server redis-server && \

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

# BEGIN BUILDER
# Update npm - Install gulp / bower
RUN npm install -g npm && \
    npm install -g bower

# Install composer / drush
RUN wget https://getcomposer.org/composer.phar -O- -q >> /usr/local/bin/composer && \
    chmod +x /usr/local/bin/composer

COPY build.sh /usr/local/bin/capcobuild
RUN chmod +x /usr/local/bin/capcobuild
# / END BUILDER

# Install fake user 1000
RUN addgroup --gid=1000 capco && \
    adduser --system --uid=1000 --home /home/capco --shell /bin/bash capco

ENV PATH $PATH:/home/capco/.composer/vendor/bin/

RUN rm -rf /var/www/html; cd /var/www ; chown -R capco:capco /var/www/
RUN mv /var/lib/mysql /var/lib/mysql_save

COPY entrypoint.sh         /entrypoint.sh

# Service
COPY mysql/run             /etc/service/mysql/run
COPY nginx/run             /etc/service/nginx/run
COPY php-fpm/run           /etc/service/php-fpm/run
COPY redis/run             /etc/service/redis/run

# Configuration
COPY nginx/nginx.conf      /etc/nginx/nginx.conf
COPY php-fpm/fpm.conf      /etc/service/php-fpm/fpm.conf
COPY php-fpm/capco.ini     /etc/php5/fpm/conf.d/capco.ini
COPY php-fpm/capco.ini     /etc/php5/cli/conf.d/capco.ini

RUN mkdir /home/capco/.ssh && echo "Host github.com\n\tStrictHostKeyChecking no\n" > /home/capco/.ssh/config
COPY ssh/id_rsa.pub /home/capco/.ssh/id_rsa.pub
COPY ssh/id_rsa /home/capco/.ssh/id_rsa
RUN chmod 600 /home/capco/.ssh/id_rsa.pub /home/capco/.ssh/id_rsa && chown capco:capco -R /home/capco/.ssh

USER capco

# Retrieve project
COPY VERSION /VERSION
RUN cd /var/www ; git clone -b develop --single-branch --depth 1 git@github.com:jolicode/CapCollectif-SF2.git .
RUN cd /var/www && /usr/local/bin/capcobuild


WORKDIR /var/www
ENTRYPOINT ["/entrypoint.sh"]

VOLUME /data

USER root

# Default command
CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

FROM debian:wheezy

MAINTAINER Bastien Jaillot <bjaillot@jolicode.com>

# Install basic
RUN apt-get update && \
    apt-get install -y wget bzip2 git libpng-dev && \

    # Install nginx and php (fpm)
    echo "deb http://packages.dotdeb.org wheezy all" > /etc/apt/sources.list.d/dotdeb.list && \
    echo "deb http://packages.dotdeb.org wheezy-php56 all" >> /etc/apt/sources.list.d/dotdeb.list && \
    wget http://www.dotdeb.org/dotdeb.gpg -O- -q | apt-key add - && \
    apt-get update && \
    apt-get install -y php5-cli php5-curl php5-intl php5-mysqli php5-redis && \

    # Install node js and deps for npm install
    wget https://deb.nodesource.com/setup -O- -q | bash - && \
    apt-get install -y nodejs npm && \

    # Clean
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Update npm - Install gulp / bower
RUN npm install -g npm && \
    npm install -g bower brunch

# Install fake user 1000
RUN addgroup --gid=1000 capco && \
    adduser --system --uid=1000 --home /home/capco --shell /bin/bash capco

# Install composer / drush
RUN wget https://getcomposer.org/composer.phar -O- -q >> /usr/local/bin/composer && \
    chmod +x /usr/local/bin/composer

COPY capco.ini /etc/php5/cli/conf.d/capco.ini
COPY build.sh /usr/local/bin/capcobuild

USER capco

CMD ["/usr/local/bin/capcobuild"]

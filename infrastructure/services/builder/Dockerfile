FROM debian:jessie

MAINTAINER Aurélien David <adavid@jolicode.com>

RUN sed -i 's/httpredir.debian.org/debian.mirrors.ovh.net/g' /etc/apt/sources.list

# Install basic
RUN apt-get update && \
    apt-get install -y --force-yes -qq --fix-missing \
        wget \
        curl \
        apt-transport-https \
        git \
        locales \
        libpng-dev \
        python-all \
        python-pip \
        build-essential \
        rlwrap \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install php7.0
RUN echo "deb http://packages.dotdeb.org jessie all" > /etc/apt/sources.list.d/dotdeb.list && \
    echo "deb-src http://packages.dotdeb.org jessie all" >> /etc/apt/sources.list.d/dotdeb.list && \
    wget http://www.dotdeb.org/dotdeb.gpg -O- -q | apt-key add - && \
    apt-get update && \
    apt-get install -y -qq \
        php7.0-cli \
        php7.0-curl \
        php7.0-gd \
        php7.0-imagick \
        php7.0-intl \
        php7.0-mysql \
        php7.0-zip \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install nodejs and deps for npm install
RUN curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
    apt-get update && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install fake user 1000
RUN mkdir -m 777 -p /home/capco
RUN groupadd --gid=1000 capco && \
    /usr/sbin/useradd --system --uid=1000 --home /home/capco --shell /bin/bash -g capco capco
RUN chown -R capco /usr/local /usr/bin /usr/lib

USER capco

# Install yarn
RUN npm install --global yarn

# Install bower
RUN npm install --global bower

# Install pep8
RUN pip install pep8 autopep8

# Install composer & php-cs-fixer
RUN wget --quiet https://getcomposer.org/composer.phar -O- >> /usr/bin/composer && \
    wget --quiet https://github.com/FriendsOfPHP/PHP-CS-Fixer/releases/download/v1.12.3/php-cs-fixer.phar -O php-cs-fixer && \
    mv php-cs-fixer /usr/bin/php-cs-fixer && \
    chmod +x /usr/bin/composer && \
    chmod +x /usr/bin/php-cs-fixer

COPY capco.ini /etc/php/7.0/cli/conf.d/capco.ini
COPY build.sh /usr/bin/build

# Use utf 8
RUN echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen && locale-gen
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# Add composer global binaries to $PATH
ENV PATH $PATH:/home/capco/.composer/vendor/bin/

WORKDIR /var/www

CMD ["/usr/local/bin/build"]

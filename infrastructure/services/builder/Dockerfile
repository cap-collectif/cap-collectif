FROM debian:jessie

MAINTAINER Bastien Jaillot <bjaillot@jolicode.com>

# Install basic
RUN apt-get update && \
    apt-get install -y --force-yes -qq \
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
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install nodejs and deps for npm install
RUN curl https://deb.nodesource.com/node_5.x/pool/main/n/nodejs/nodejs_5.1.1-1nodesource1~jessie1_amd64.deb > node.deb && \
    dpkg -i node.deb && \
    npm set progress=false && \
    rm node.deb

# Update npm and install bower
RUN npm install -g bower

# Install pep8
RUN pip install pep8 autopep8

# Install fake user 1000
RUN mkdir -m 777 -p /home/capco
RUN groupadd --gid=1000 capco && \
    /usr/sbin/useradd --system --uid=1000 --home /home/capco --shell /bin/bash -g capco capco

# Install composer & php-cs-fixer
RUN wget https://getcomposer.org/composer.phar -O- -q >> /usr/local/bin/composer && \
    wget http://get.sensiolabs.org/php-cs-fixer.phar -O- -q >> /usr/local/bin/php-cs-fixer && \
    chmod +x /usr/local/bin/composer && \
    chmod +x /usr/local/bin/php-cs-fixer

COPY capco.ini /etc/php5/cli/conf.d/capco.ini
COPY build.sh /usr/local/bin/build

# Use utf 8
RUN echo "en_US.UTF-8 UTF-8" >> /etc/locale.gen && locale-gen
ENV LANG en_US.UTF-8
ENV LANGUAGE en_US:en
ENV LC_ALL en_US.UTF-8

# Add composer global binaries to $PATH
ENV PATH $PATH:/home/capco/.composer/vendor/bin/

USER capco
WORKDIR /var/www

CMD ["/usr/local/bin/build"]

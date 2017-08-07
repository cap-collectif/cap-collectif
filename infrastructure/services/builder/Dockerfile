FROM debian:jessie

MAINTAINER Aurélien David <adavid@jolicode.com>

RUN sed -i 's/httpredir.debian.org/debian.mirrors.ovh.net/g' /etc/apt/sources.list
RUN apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys E871F18B51E0147C77796AC81196BA81F6B0FC61 \
	|| apt-key adv --keyserver hkp://pgp.mit.edu:80 --recv-keys E871F18B51E0147C77796AC81196BA81F6B0FC61

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

# Install php7.1
RUN wget -O- https://packages.sury.org/php/apt.gpg | apt-key add - && \
    echo "deb https://packages.sury.org/php/ jessie main" > /etc/apt/sources.list.d/php.list && \
    apt-get update && \
    apt-get install -y -qq \
        php7.1-cli \
        php7.1-curl \
        php7.1-gd \
        php7.1-imagick \
        php7.1-intl \
        php7.1-mysql \
        php7.1-zip \
        php7.1-mbstring \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install nodejs and deps for npm install
# gpg keys listed at https://github.com/nodejs/node#release-team
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
    56730D5401028683275BD23C23EFEFE93C4CFFFE \
  ; do \
    gpg --keyserver pgp.mit.edu --recv-keys "$key" || \
    gpg --keyserver keyserver.pgp.com --recv-keys "$key" || \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key" ; \
  done
ENV NPM_CONFIG_LOGLEVEL warn
ENV NODE_VERSION 6.11.0
RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-x64.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 \
  && rm "node-v$NODE_VERSION-linux-x64.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs

# Install fake user 1000
RUN mkdir -m 777 -p /home/capco
RUN groupadd --gid=1000 capco && \
    /usr/sbin/useradd --system --uid=1000 --home /home/capco --shell /bin/bash -g capco capco
RUN chown -R capco /usr/local /usr/bin /usr/lib

USER capco

# Install yarn
RUN npm install -g yarn@0.27.5

# Install bower
RUN npm install --global bower@1.8.0

# Install pep8
RUN pip install pep8 autopep8

# Install composer & php-cs-fixer
RUN wget --quiet https://getcomposer.org/composer.phar -O- >> /usr/bin/composer && \
    wget --quiet https://github.com/FriendsOfPHP/PHP-CS-Fixer/releases/download/v2.4.0/php-cs-fixer.phar -O /usr/bin/php-cs-fixer && \
    chmod +x /usr/bin/composer && \
    chmod +x /usr/bin/php-cs-fixer

COPY capco.ini /etc/php/7.1/cli/conf.d/capco.ini
COPY build.sh /usr/bin/build

# Add composer global binaries to $PATH
ENV PATH $PATH:/home/capco/.composer/vendor/bin/

WORKDIR /var/www

CMD ["/usr/local/bin/build"]

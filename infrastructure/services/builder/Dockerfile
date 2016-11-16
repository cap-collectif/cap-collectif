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
# gpg keys listed at https://github.com/nodejs/node
RUN set -ex \
  && for key in \
    9554F04D7259F04124DE6B476D5A82AC7E37093B \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    0034A06D9D9B0064CE8ADF6BF1747F4AD2306D93 \
    FD3A5288F042B6850C66B31F09FE44734EB7990E \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    B9AE9905FFD7803F25714661B63B535A4C206CA9 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
  ; do \
    gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$key"; \
  done

ENV NPM_CONFIG_LOGLEVEL info
ENV NODE_VERSION 6.9.1

RUN curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" \
  && curl -SLO "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
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
RUN npm install --global yarn

# Install bower
RUN npm install --global bower

# Install pep8
RUN pip install pep8 autopep8

# Install composer & php-cs-fixer
RUN wget --quiet https://getcomposer.org/composer.phar -O- >> /usr/bin/composer && \
    wget --quiet https://github.com/FriendsOfPHP/PHP-CS-Fixer/releases/download/v1.12.3/php-cs-fixer.phar -O /usr/bin/php-cs-fixer && \
    chmod +x /usr/bin/composer && \
    chmod +x /usr/bin/php-cs-fixer

COPY capco.ini /etc/php/7.0/cli/conf.d/capco.ini
COPY build.sh /usr/bin/build


# Add composer global binaries to $PATH
ENV PATH $PATH:/home/capco/.composer/vendor/bin/

WORKDIR /var/www

CMD ["/usr/local/bin/build"]

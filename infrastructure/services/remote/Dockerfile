FROM debian:buster

LABEL maintainer "Cap collectif <tech@cap-collectif.com>"

# Install basic
RUN set -x \
    && DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y -qq --fix-missing --no-install-recommends \
        adduser \
        ca-certificates \
        apt-transport-https \
        build-essential \
        bzip2 \
        cron \
        curl \
        git \
        imagemagick \
        libmagickwand-dev \
        locales \
        pkg-config \
        runit \
        wget \
        libicu-dev \
        sqlite \
        software-properties-common \
        locales \
        gnupg2 \
        dirmngr \
        netcat \
        vim \
        nginx \
        nginx-common \
        libnginx-mod-http-geoip \
        dnsutils \
    && \
    localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8 && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ENV LANG C.UTF-8

# Install php7
RUN wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg
RUN wget -O- https://packages.sury.org/php/apt.gpg | apt-key add - && \
    echo "deb https://packages.sury.org/php/ buster main" > /etc/apt/sources.list.d/php.list && \
    DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y -qq \
        php7.4-apcu \
        php7.4-cli \
        php7.4-mbstring \
        php7.4-common \
        php7.4-curl \
        php7.4-dev \
        php7.4-fpm \
        php7.4-gd \
        php7.4-imagick \
        php7.4-intl \
        php7.4-json \
        php7.4-mysql \
        php7.4-opcache \
        php7.4-sqlite3 \
        php7.4-redis \
        php7.4-xsl \
        php7.4-zip \
        php7.4-xml \
        php7.4-amqp \
        php7.4-simplexml \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN echo "extension=apcu.so" > /etc/php/7.4/php.ini
RUN echo "apc.enable_cli=1" > /etc/php/7.4/php.ini
RUN echo "apc.enable=1" > /etc/php/7.4//php.ini

# Install gosu binary (needs wget and ca-certificates).
ENV GOSU_VERSION 1.10
RUN set -ex; \
	dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')"; \
	wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch"; \
	wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc"; \
	chmod +x /usr/local/bin/gosu; \
    # verify that the binary works
	gosu nobody true

# Install fake user 1000
RUN addgroup --gid=1000 capco && \
    adduser --system --uid=1000 --home /home/capco --shell /bin/bash capco

# Install composer
RUN curl -o /tmp/composer-setup.php https://getcomposer.org/installer \
    && curl -o /tmp/composer-setup.sig https://composer.github.io/installer.sig \
    && php -r "if (hash('SHA384', file_get_contents('/tmp/composer-setup.php')) !== trim(file_get_contents('/tmp/composer-setup.sig'))) { unlink('/tmp/composer-setup.php'); echo 'Invalid installer' . PHP_EOL; exit(1); }" \
    && php /tmp/composer-setup.php --version=2.0.7 --no-ansi --install-dir=/usr/local/bin --filename=composer --version=2.0.7 \
    && rm -f /tmp/composer-setup.*

# Install redis
RUN apt-get update -y && \
    apt-get install -y -qq --no-install-recommends \
        redis-server \
    && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*&& \
    sed -i 's/^\(bind .*\)$/# \1/' /etc/redis/redis.conf && \
    sed -i 's/^\(daemonize .*\)$/# \1/' /etc/redis/redis.conf && \
    sed -i 's/^\(dir .*\)$/# \1\ndir \/data/' /etc/redis/redis.conf && \
    sed -i 's/^\(logfile .*\)$/# \1/' /etc/redis/redis.conf

# Install ES
ENV ES_VERSION_PACKAGE 7.16.1-linux-x86_64
ENV ES_VERSION 7.16.1
RUN cd / && \
    wget https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-$ES_VERSION_PACKAGE.tar.gz && \
    tar -xzf elasticsearch-$ES_VERSION_PACKAGE.tar.gz && \
    rm -f elasticsearch-$ES_VERSION_PACKAGE.tar.gz && \
    mv /elasticsearch-$ES_VERSION /etc/elasticsearch
RUN /etc/elasticsearch/bin/elasticsearch-plugin install --batch analysis-icu

# Install RabbitMQ
RUN apt update -y && apt-get install curl gnupg debian-keyring debian-archive-keyring apt-transport-https -y && \
    tee /etc/apt/sources.list.d/rabbitmq.list

## Team RabbitMQ's main signing key
RUN apt-key adv --keyserver "hkps://keys.openpgp.org" --recv-keys "0x0A9AF2115F4687BD29803A206B73A36E6026DFCA" && \
    apt-key adv --keyserver "keyserver.ubuntu.com" --recv-keys "F77F1EDA57EBB1CC"  && \
    apt-key adv --keyserver "keyserver.ubuntu.com" --recv-keys "F6609E60DC62814E" && \
    add-apt-repository 'deb http://ppa.launchpad.net/rabbitmq/rabbitmq-erlang/ubuntu/ bionic main' && \
    add-apt-repository 'deb https://packagecloud.io/rabbitmq/rabbitmq-server/ubuntu/ bionic main'

## Install rabbitmq-server and its dependencies
RUN apt-get install rabbitmq-server -y --fix-missing && \
    rabbitmq-plugins enable rabbitmq_management

# Install mariadb
RUN set -x \
    && DEBIAN_FRONTEND=noninteractive apt-get install mariadb-server -y -qq \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Install varnish
RUN apt-get update -y && \
	apt-get install -y build-essential automake libtool curl git python-docutils && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

RUN curl https://packagecloud.io/install/repositories/varnishcache/varnish66/script.deb.sh | /bin/bash && \
	    apt-get install -y varnish-dev && \
        git clone -b 0.18.0 https://github.com/varnish/varnish-modules.git /tmp/vm && \
	    cd /tmp/vm && \
	    ./bootstrap && \
	    ./configure && \
	    make && \
	    make install

# Install antivirus deamon
RUN apt-get install -y clamav

# Install Supervisor
RUN apt-get update && \
    apt-get install -y python-pip python-setuptools supervisor --no-install-recommends && \
    pip install supervisor && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Move mysql elsewhere because /var/lib/mysql will be a volume after build (see mysql/run)
RUN mv /var/lib/mysql /var/lib/mysql_save

# Service
COPY infrastructure/services/remote/mysql/run                  /etc/service/mysql/run
COPY infrastructure/services/remote/nginx/run                  /etc/service/nginx/run
COPY infrastructure/services/remote/redis/run                  /etc/service/redis/run
COPY infrastructure/services/remote/cron/run                   /etc/service/cron/run
COPY infrastructure/services/remote/elasticsearch/run          /etc/service/elasticsearch/run
COPY infrastructure/services/remote/varnish/run                /etc/service/varnish/run
COPY infrastructure/services/remote/rabbitmq/run               /etc/service/rabbitmq/run
COPY infrastructure/services/remote/nodejs/run                 /etc/service/nodejs/run
COPY infrastructure/services/remote/supervisord/run            /etc/service/supervisord/run
COPY infrastructure/services/remote/php-fpm/run                /etc/service/php-fpm/run
COPY infrastructure/services/remote/redirectionio/run          /etc/service/redirectionio/run

# Configuration
COPY infrastructure/services/remote/mysql/capco.cnf                /etc/mysql/conf.d/capco.cnf
COPY infrastructure/services/remote/nginx/fastcgi_forward.conf     /etc/nginx/fastcgi_forward.conf
COPY infrastructure/services/remote/nginx/default_headers.conf     /etc/nginx/default_headers.conf
COPY infrastructure/services/remote/nginx/nginx.conf               /etc/nginx/nginx.conf
COPY infrastructure/services/remote/php-fpm/capco.ini              /etc/php/7.4/fpm/conf.d/capco.ini
COPY infrastructure/services/remote/php-fpm/capco.ini              /etc/php/7.4/cli/conf.d/capco.ini
COPY infrastructure/services/remote/php-fpm/fpm.conf               /etc/service/php-fpm/fpm.conf
COPY infrastructure/services/remote/cron/crontab                   /etc/cron.d/crontab
COPY infrastructure/services/remote/elasticsearch/capco.yml        /etc/elasticsearch/config/elasticsearch.yml
COPY infrastructure/services/remote/varnish/capco.vcl              /etc/varnish/capco.vcl
COPY infrastructure/services/remote/rabbitmq/rabbitmq.config       /etc/rabbitmq/rabbitmq.config
COPY infrastructure/services/remote/logrotate/mysql-slow-logs      /etc/logrotate.d/mysql-slow-logs
COPY infrastructure/services/remote/supervisord/                   /etc/supervisord
COPY infrastructure/services/remote/redirectionio/agent.yml        /etc/redirectionio/agent.yml

# Cache storage for rules
VOLUME /var/lib/redirectionio

# Binaries / Scripts
COPY infrastructure/services/remote/rabbitmq/rabbitmqadmin          /usr/local/bin/rabbitmqadmin
COPY infrastructure/services/remote/cron/antivirus                  /etc/cron.daily
COPY infrastructure/services/remote/cron/check_db_schema            /etc/cron.hourly

# Daemons
COPY infrastructure/services/remote/php-fpm/populate_elasticsearch_index /etc/service/php-fpm/populate_elasticsearch_index

# NodeJS
ENV NODE_VERSION 18.20.3
RUN ARCH= && dpkgArch="$(dpkg --print-architecture)" \
  && case "${dpkgArch##*-}" in \
    amd64) ARCH='x64';; \
    ppc64el) ARCH='ppc64le';; \
    s390x) ARCH='s390x';; \
    arm64) ARCH='arm64';; \
    armhf) ARCH='armv7l';; \
    i386) ARCH='x86';; \
    *) echo "unsupported architecture"; exit 1 ;; \
  esac \
  # gpg keys listed at https://github.com/nodejs/node#release-keys
  && set -ex \
  && for key in \
    4ED778F539E3634C779C87C6D7062848A1AB005C \
    94AE36675C464D64BAFA68DD7434390BDBE9B9C5 \
    74F12602B6F1C4E913FAA37AD3A89613643B6201 \
    71DCFD284A79C3B38668286BC97EC7A07EDE3FC1 \
    8FCCA13FEF1D0C2E91008E09770F7A9A5AE15600 \
    C4F0DFFF4E8C1A8236409D08E73BC641CC11F4C8 \
    C82FA3AE1CBEDC6BE46B9360C43CEC45C17AB93C \
    DD8F2338BAE7501E3DD5AC78C273792F7D83545D \
    A48C2BEE680E841632CD4E44F07496B3EB3C1762 \
    108F52B48DB57BB0CC439B2997B01419BD92F80A \
    B9E2F5981AA6E0CD28160D9FF13993A75599653C \
  ; do \
      gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys "$key" || \
      gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key" ; \
  done \
  && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-$ARCH.tar.xz" \
  && curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/SHASUMS256.txt.asc" \
  && gpg --batch --decrypt --output SHASUMS256.txt SHASUMS256.txt.asc \
  && grep " node-v$NODE_VERSION-linux-$ARCH.tar.xz\$" SHASUMS256.txt | sha256sum -c - \
  && tar -xJf "node-v$NODE_VERSION-linux-$ARCH.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
  && rm "node-v$NODE_VERSION-linux-$ARCH.tar.xz" SHASUMS256.txt.asc SHASUMS256.txt \
  && ln -s /usr/local/bin/node /usr/local/bin/nodejs \
  # smoke tests
  && node --version \
  && npm --version

ENV YARN_VERSION 1.22.5

RUN set -ex \
  && for key in \
    6A010C5166006599AA17F08146C2130DFD2497F5 \
  ; do \
    gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys "$key" || \
    gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key" ; \
  done \
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
  && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz.asc" \
  && gpg --batch --verify yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  && mkdir -p /opt \
  && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
  && ln -s /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
  && rm yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
  # smoke test
  && yarn --version

RUN yarn global add pm2

# RedirectionIO
WORKDIR /usr/local/bin/
RUN wget https://packages.redirection.io/dist/redirectionio-agent-latest_any_amd64.tar.gz
RUN tar -xzvf redirectionio-agent-latest_any_amd64.tar.gz

# Create Working dir with good rights
RUN mkdir -p /var/www \
    && chown capco:capco /var/www \
    && chmod 0644 /etc/cron.d/crontab \
    && find /etc/service/ -name "run" -exec chmod +x {} \;

WORKDIR /var/www

# Download PHP dependencies
COPY composer.json composer.lock ./

# Will only install bundles that have changed since building the base image
RUN gosu capco composer install --no-dev --prefer-dist --no-interaction --ignore-platform-reqs --no-progress

# Then add usefull source code for production
# -- Symfony app --
COPY bin /var/www/bin
COPY translations /var/www/translations
COPY public /var/www/public
COPY src /var/www/src
COPY app /var/www/app
COPY assets /var/www/assets
COPY frontend /var/www/frontend
COPY templates /var/www/templates
COPY config /var/www/config
COPY fixtures /var/www/fixtures

# -- NextJS app (admin-next) --
# Make sure "admin-next/.next" is built during previous CI step
# For now we copy everything, but it can be improved see https://nextjs.org/docs/deployment#docker-image
COPY admin-next /var/www/admin-next
COPY node_modules /var/www/node_modules

RUN mkdir -m 755 -p /tmp/phpstan/cache/PHPStan/

# Symfony env
ENV SYMFONY_ENVIRONMENT prod
ENV SYMFONY_DEBUG false

# Maybe chown before copy will be faster
RUN mkdir -m 755 -p translations var public/bundles src/Capco/AppBundle/GraphQL/__generated__ \
    && chown -R capco:capco bin translations src public templates config app fixtures admin-next \
    && mkdir -p var/cache/prod \
    && mkdir -p var/cache/prod/translations \
    && chmod -R 777 var \
    && chown -R capco:capco var

# Admin-next
ENV ADMIN_NEXT_PORT 3000
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# make pam_loginuid.so optional for cron
# see https://github.com/docker/docker/issues/5663#issuecomment-42550548
RUN sed --regexp-extended --in-place \
    's/^session\s+required\s+pam_loginuid.so$/session optional pam_loginuid.so/' \
    /etc/pam.d/cron

# /!\
# /!\ Beyond this step nothing is cached /!\
# /!\
ARG APP_VERSION="latest"
ARG SYMFONY_MANDRILL_API_KEY="INSERT_A_REAL_SECRET"
ARG SYMFONY_MAILJET_PUBLIC_KEY="INSERT_A_REAL_SECRET"
ARG SYMFONY_MAILJET_PRIVATE_KEY="INSERT_A_REAL_SECRET"
ARG SYMFONY_SMS_PROVIDER="INSERT_A_REAL_SECRET"
ARG SYMFONY_TWILIO_SID="INSERT_A_REAL_SECRET"
ARG SYMFONY_TWILIO_TOKEN="INSERT_A_REAL_SECRET"
ARG SYMFONY_TWILIO_DEFAULT_SUBACCOUNT_TOKEN="INSERT_A_REAL_SECRET"
ARG SYMFONY_TWILIO_DEFAULT_SUBACCOUNT_SID="INSERT_A_REAL_SECRET"
ARG SYMFONY_TWILIO_DEFAULT_VERIFY_SERVICE_ID="INSERT_A_REAL_SECRET"
ARG SYMFONY_ORANGE_API_CLIENT_ID="INSERT_A_REAL_SECRET"
ARG SYMFONY_ORANGE_API_CLIENT_SECRET="INSERT_A_REAL_SECRET"
ARG SYMFONY_RECAPTCHA_PRIVATE_KEY="INSERT_A_REAL_SECRET"
ARG SLACK_JPEC_GHOST="INSERT_A_REAL_SECRET"
ARG SLACK_OMAR_DJINN="INSERT_A_REAL_SECRET"
ARG SYMFONY_PANTHER_URL="INSERT_A_REAL_SECRET"
ARG SYMFONY_PANTHER_TOKEN="INSERT_A_REAL_SECRET"
ARG SYMFONY_MAPBOX_PUBLIC_KEY="INSERT_A_REAL_SECRET"
ARG SYMFONY_MAPBOX_SECRET_KEY="INSERT_A_REAL_SECRET"
ARG SYMFONY_GOOGLE_MAP_PUBLIC_KEY="INSERT_A_REAL_SECRET"
ARG SYMFONY_GOOGLE_MAP_SERVER_KEY="INSERT_A_REAL_SECRET"
ARG SYMFONY_LOGPUSH_ELASTICSEARCH_HOST="INSERT_A_REAL_SECRET"
ARG SYMFONY_LOGPUSH_ELASTICSEARCH_PORT="INSERT_A_REAL_SECRET"
ARG SYMFONY_LOGPUSH_ELASTICSEARCH_INDEX="INSERT_A_REAL_SECRET"
ARG SYMFONY_LOGPUSH_ELASTICSEARCH_USERNAME="INSERT_A_REAL_SECRET"
ARG SYMFONY_LOGPUSH_ELASTICSEARCH_PASSWORD="INSERT_A_REAL_SECRET"
ARG SYMFONY_DEPLOYER_API_URL="INSERT_A_REAL_SECRET"
ARG SYMFONY_CAS_CERTIFICATE_DIRECTORY="INSERT_A_REAL_SECRET"
ARG SYMFONY_INSTANCE_REMEMBER_SECRET="INSERT_A_REAL_SECRET"
ARG SYMFONY_REDIS_PREFIX="INSERT_A_REAL_SECRET"
ARG SYMFONY_SENDINBLUE_API_KEY="INSERT_A_REAL_SECRET"
ARG SYMFONY_SENDINBLUE_NL_LIST_ID="INSERT_A_REAL_SECRET"
ARG SYMFONY_SENDINBLUE_SECRET="INSERT_A_REAL_SECRET"
ARG SYMFONY_MAGICLINKS_DURATION_IN_MINUTES="SYMFONY_MAGICLINKS_DURATION_IN_MINUTES"

ENV SYMFONY_DEPLOYER_API_URL=$SYMFONY_DEPLOYER_API_URL
ENV SYMFONY_APP_VERSION=$APP_VERSION
ENV SYMFONY_MANDRILL_API_KEY=$SYMFONY_MANDRILL_API_KEY
ENV SYMFONY_MAILJET_PUBLIC_KEY=$SYMFONY_MAILJET_PUBLIC_KEY
ENV SYMFONY_MAILJET_PRIVATE_KEY=$SYMFONY_MAILJET_PRIVATE_KEY
ENV SYMFONY_SMS_PROVIDER=$SYMFONY_SMS_PROVIDER
ENV SYMFONY_TWILIO_SID=$SYMFONY_TWILIO_SID
ENV SYMFONY_TWILIO_TOKEN=$SYMFONY_TWILIO_TOKEN
ENV SYMFONY_RECAPTCHA_PRIVATE_KEY=$SYMFONY_RECAPTCHA_PRIVATE_KEY
ENV SYMFONY_ORANGE_API_CLIENT_ID=$SYMFONY_ORANGE_API_CLIENT_ID
ENV SYMFONY_ORANGE_API_CLIENT_SECRET=$SYMFONY_ORANGE_API_CLIENT_SECRET
ENV SLACK_JPEC_GHOST=$SLACK_JPEC_GHOST
ENV SLACK_OMAR_DJINN=$SLACK_OMAR_DJINN
ENV SYMFONY_PANTHER_URL=$SYMFONY_PANTHER_URL
ENV SYMFONY_PANTHER_TOKEN=$SYMFONY_PANTHER_TOKEN
ENV SYMFONY_MAPBOX_PUBLIC_KEY=$SYMFONY_MAPBOX_PUBLIC_KEY
ENV SYMFONY_MAPBOX_SECRET_KEY=$SYMFONY_MAPBOX_SECRET_KEY
ENV SYMFONY_GOOGLE_MAP_PUBLIC_KEY=$SYMFONY_GOOGLE_MAP_PUBLIC_KEY
ENV SYMFONY_GOOGLE_MAP_SERVER_KEY=$SYMFONY_GOOGLE_MAP_SERVER_KEY
ENV SYMFONY_TWILIO_DEFAULT_SUBACCOUNT_TOKEN=$SYMFONY_TWILIO_DEFAULT_SUBACCOUNT_TOKEN
ENV SYMFONY_TWILIO_DEFAULT_SUBACCOUNT_SID=$SYMFONY_TWILIO_DEFAULT_SUBACCOUNT_SID
ENV SYMFONY_TWILIO_DEFAULT_VERIFY_SERVICE_ID=$SYMFONY_TWILIO_DEFAULT_VERIFY_SERVICE_ID
ENV SYMFONY_LOGPUSH_ELASTICSEARCH_HOST=$SYMFONY_LOGPUSH_ELASTICSEARCH_HOST
ENV SYMFONY_LOGPUSH_ELASTICSEARCH_PORT=$SYMFONY_LOGPUSH_ELASTICSEARCH_PORT
ENV SYMFONY_LOGPUSH_ELASTICSEARCH_INDEX=$SYMFONY_LOGPUSH_ELASTICSEARCH_INDEX
ENV SYMFONY_LOGPUSH_ELASTICSEARCH_USERNAME=$SYMFONY_LOGPUSH_ELASTICSEARCH_USERNAME
ENV SYMFONY_LOGPUSH_ELASTICSEARCH_PASSWORD=$SYMFONY_LOGPUSH_ELASTICSEARCH_PASSWORD
ENV SYMFONY_CAS_CERTIFICATE_DIRECTORY=$SYMFONY_CAS_CERTIFICATE_DIRECTORY
ENV SYMFONY_INSTANCE_REMEMBER_SECRET=$SYMFONY_INSTANCE_REMEMBER_SECRET
ENV SYMFONY_REDIS_PREFIX=$SYMFONY_REDIS_PREFIX
ENV SYMFONY_SENDINBLUE_API_KEY=$SYMFONY_SENDINBLUE_API_KEY
ENV SYMFONY_SENDINBLUE_NL_LIST_ID=$SYMFONY_SENDINBLUE_NL_LIST_ID
ENV SYMFONY_SENDINBLUE_SECRET=$SYMFONY_SENDINBLUE_SECRET
ENV SYMFONY_MAGICLINKS_DURATION_IN_MINUTES=$SYMFONY_MAGICLINKS_DURATION_IN_MINUTES

# Build autoloader and initialize Symfony
RUN gosu capco php bin/console graphql:compile --env=${SYMFONY_ENVIRONMENT} \
    && gosu capco composer dump-autoload --no-dev --optimize --apcu \
    && gosu capco php -d memory_limit=-1 bin/console cache:warmup --env=$SYMFONY_ENVIRONMENT --no-interaction \
    && gosu capco php bin/console assets:install public --symlink --env=${SYMFONY_ENVIRONMENT} --no-interaction

# Install crontab just to check if it's valid.
RUN set -ex; \
    crontab -uroot /etc/cron.d/crontab

CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

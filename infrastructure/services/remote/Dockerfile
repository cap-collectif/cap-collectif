FROM debian:bullseye

ENV PHP_VERSION 8.1

LABEL maintainer "Cap collectif <tech@cap-collectif.com>"

RUN echo "deb [trusted=yes] http://repo.olvycloud.com/mariadb/10.3/bullseye /" >> /etc/apt/sources.list.d/mariadb.list

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
        sqlite3 \
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
    localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8

ENV LANG C.UTF-8

# Install php8.1
RUN wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg
RUN wget -O- https://packages.sury.org/php/apt.gpg | apt-key add - && \
    echo "deb https://packages.sury.org/php/ bullseye main" > /etc/apt/sources.list.d/php.list && \
    DEBIAN_FRONTEND=noninteractive apt-get update && \
    apt-get install -y -qq \
        php${PHP_VERSION}-apcu \
        php${PHP_VERSION}-cli \
        php${PHP_VERSION}-mbstring \
        php${PHP_VERSION}-common \
        php${PHP_VERSION}-curl \
        php${PHP_VERSION}-dev \
        php${PHP_VERSION}-fpm \
        php${PHP_VERSION}-gd \
        php${PHP_VERSION}-imagick \
        php${PHP_VERSION}-intl \
        php${PHP_VERSION}-mysql \
        php${PHP_VERSION}-opcache \
        php${PHP_VERSION}-sqlite3 \
        php${PHP_VERSION}-xsl \
        php${PHP_VERSION}-zip \
        php${PHP_VERSION}-xml \
        php${PHP_VERSION}-amqp \
        php${PHP_VERSION}-simplexml

# TODO This block needs to be removed after migrating to Symfony 6.4 and redis extension needs to be installed like the others above.
# ( Bug in symfony Cache component with redis version > 6.0.3: https://github.com/symfony/symfony/pull/57885 )
RUN pecl install redis-6.0.2

RUN <<EOF
echo "
extension='redis.so'
" >> /etc/php/${PHP_VERSION}/mods-available/redis.ini
EOF

RUN ln -s /etc/php/${PHP_VERSION}/mods-available/redis.ini /etc/php/${PHP_VERSION}/cli/conf.d/25-redis.ini \
    && ln -s /etc/php/${PHP_VERSION}/mods-available/redis.ini /etc/php/${PHP_VERSION}/fpm/conf.d/25-redis.ini
### end of block

RUN echo "extension=apcu.so" > /etc/php/${PHP_VERSION}/php.ini
RUN echo "apc.enable_cli=1" > /etc/php/${PHP_VERSION}/php.ini
RUN echo "apc.enable=1" > /etc/php/${PHP_VERSION}/php.ini

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
    && php /tmp/composer-setup.php --version=2.8.4 --no-ansi --install-dir=/usr/local/bin --filename=composer --version=2.8.4 \
    && rm -f /tmp/composer-setup.*

# Install redis
RUN apt-get install -y -qq --no-install-recommends \
        redis-server && \
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
RUN apt-get install curl gnupg debian-keyring debian-archive-keyring apt-transport-https -y && \
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
    && DEBIAN_FRONTEND=noninteractive apt-get install mariadb-server-10.3 mariadb-client-10.3 -y -qq

# Install varnish
RUN apt-get install -y varnish varnish-modules

# Install ClamAV antivirus daemon
RUN apt-get install -y clamav-daemon clamav-freshclam && \
    mkdir -p /var/run/clamav && \
    chown clamav:clamav /var/run/clamav && \
    sed -i 's/^LocalSocket .*$/LocalSocket \/var\/run\/clamav\/clamd.sock/' /etc/clamav/clamd.conf && \
    freshclam || true

# Install Supervisor
RUN apt-get install -y supervisor

# Clean apt cache to have a lighter image
RUN apt-get clean && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*


# Remove mysql datadir because /var/lib/mysql will be a volume after build (see mysql/run)
RUN rm -rf /var/lib/mysql

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
COPY infrastructure/services/remote/php-fpm/capco.ini              /etc/php/${PHP_VERSION}/fpm/conf.d/capco.ini
COPY infrastructure/services/remote/php-fpm/capco.ini              /etc/php/${PHP_VERSION}/cli/conf.d/capco.ini
COPY infrastructure/services/remote/php-fpm/fpm.conf               /etc/service/php-fpm/fpm.conf
COPY infrastructure/services/remote/elasticsearch/capco.yml        /etc/elasticsearch/config/elasticsearch.yml
COPY infrastructure/services/remote/varnish/capco.vcl              /etc/varnish/capco.vcl
COPY infrastructure/services/remote/rabbitmq/rabbitmq.config       /etc/rabbitmq/rabbitmq.config
COPY infrastructure/services/remote/logrotate/mysql-slow-logs      /etc/logrotate.d/mysql-slow-logs
COPY infrastructure/services/remote/supervisord/                   /etc/supervisord
COPY infrastructure/services/remote/redirectionio/agent.yml        /etc/redirectionio/agent.yml

# Cache storage for rules
VOLUME /var/lib/redirectionio

# Binaries / Scripts
COPY infrastructure/services/remote/rabbitmq/rabbitmqadmin                /usr/local/bin/rabbitmqadmin
COPY infrastructure/services/remote/cron/antivirus                        /etc/cron.daily
COPY infrastructure/services/remote/cron/check_db_schema                  /etc/cron.hourly
COPY infrastructure/services/remote/cron/rabbitmq_queues_supervision      /usr/local/bin/rabbitmq_queues_supervision

# Daemons
COPY infrastructure/services/remote/php-fpm/populate_elasticsearch_index /etc/service/php-fpm/populate_elasticsearch_index

# NodeJS
ENV NODE_VERSION 20.19.6
RUN apt-get update \
  && apt-get install -y curl ca-certificates

RUN set -eux; \
  dpkgArch="$(dpkg --print-architecture)"; \
  case "${dpkgArch##*-}" in \
    amd64)   ARCH='x64' ;; \
    arm64)   ARCH='arm64' ;; \
    armhf)   ARCH='armv7l' ;; \
    i386)    ARCH='x86' ;; \
    ppc64el) ARCH='ppc64le' ;; \
    s390x)   ARCH='s390x' ;; \
    *) echo "Unsupported architecture: ${dpkgArch}"; exit 1 ;; \
  esac; \
  NODE_VERSION=20.19.6; \
  curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${ARCH}.tar.xz"; \
  curl -fsSLO "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt"; \
  grep " node-v${NODE_VERSION}-linux-${ARCH}.tar.xz\$" SHASUMS256.txt | sha256sum -c -; \
  tar -xJf "node-v${NODE_VERSION}-linux-${ARCH}.tar.xz" -C /usr/local --strip-components=1; \
  rm "node-v${NODE_VERSION}-linux-${ARCH}.tar.xz" SHASUMS256.txt; \
  node --version; \
  npm --version

ENV YARN_VERSION 1.22.10

RUN set -ex \
  && for key in \
    6A010C5166006599AA17F08146C2130DFD2497F5 \
    6D98490C6F1ACDDD448E45954F77679369475BAA \
  ; do \
    gpg --batch --keyserver hkps://keyserver.ubuntu.com --recv-keys "$key" || \
    gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key" || \
    gpg --batch --keyserver hkps://pgp.mit.edu --recv-keys "$key" ; \
    gpg --batch --list-keys "$key" > /dev/null ; \
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
    && find /etc/service/ -name "run" -exec chmod +x {} \;

WORKDIR /var/www

# Download PHP dependencies
COPY --chown=capco:capco composer.json composer.lock ./

# Will only install bundles that have changed since building the base image
RUN gosu capco composer install --no-dev --prefer-dist --no-interaction --ignore-platform-reqs --no-progress

# Then add usefull source code for production
# -- Symfony app --
COPY --chown=capco:capco bin /var/www/bin
COPY --chown=capco:capco translations /var/www/translations
COPY --chown=capco:capco public /var/www/public
COPY --chown=capco:capco src /var/www/src
COPY --chown=capco:capco app /var/www/app
COPY --chown=capco:capco assets /var/www/assets
COPY --chown=capco:capco frontend /var/www/frontend
COPY --chown=capco:capco templates /var/www/templates
COPY --chown=capco:capco config /var/www/config
COPY --chown=capco:capco fixtures /var/www/fixtures

# -- NextJS app (admin-next) --
# Make sure "admin-next/.next" is built during previous CI step
# For now we copy everything, but it can be improved see https://nextjs.org/docs/deployment#docker-image
COPY --chown=capco:capco admin-next /var/www/admin-next
COPY --chown=capco:capco node_modules /var/www/node_modules

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
ARG SYMFONY_ORANGE_REQUEST_ID_EXPIRATION_TIME="INSERT_A_REAL_SECRET"
ARG SYMFONY_RECAPTCHA_PRIVATE_KEY="INSERT_A_REAL_SECRET"
ARG SLACK_JPEC_GHOST="INSERT_A_REAL_SECRET"
ARG SLACK_OMAR_DJINN="INSERT_A_REAL_SECRET"
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
ARG SUPERVISORD_SWARROT_ES_INDEXATION_NUMPROCS=1
ARG SLACK_WEBHOOK_QUEUES_MONITOR="INSERT_A_REAL_SECRET"

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
ENV SYMFONY_ORANGE_REQUEST_ID_EXPIRATION_TIME=$SYMFONY_ORANGE_REQUEST_ID_EXPIRATION_TIME
ENV SLACK_JPEC_GHOST=$SLACK_JPEC_GHOST
ENV SLACK_OMAR_DJINN=$SLACK_OMAR_DJINN
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
ENV SUPERVISORD_SWARROT_ES_INDEXATION_NUMPROCS=$SUPERVISORD_SWARROT_ES_INDEXATION_NUMPROCS
ENV SLACK_WEBHOOK_QUEUES_MONITOR=$SLACK_WEBHOOK_QUEUES_MONITOR

# Build autoloader and initialize Symfony
RUN gosu capco php bin/console graphql:compile --env=${SYMFONY_ENVIRONMENT} \
    && gosu capco composer dump-autoload --no-dev --optimize --apcu \
    && gosu capco php -d memory_limit=-1 bin/console cache:warmup --env=${SYMFONY_ENVIRONMENT} --no-interaction \
    && gosu capco php bin/console assets:install public --symlink --env=${SYMFONY_ENVIRONMENT} --no-interaction

# Install crontab just to check if it's valid.
COPY infrastructure/services/remote/cron/crontab                   /etc/cron.d/crontab
RUN chmod 0644 /etc/cron.d/crontab
RUN set -ex; \
    crontab -uroot /etc/cron.d/crontab

CMD ["/usr/bin/runsvdir", "-P", "/etc/service"]

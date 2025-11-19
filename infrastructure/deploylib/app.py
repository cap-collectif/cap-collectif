from sys import platform as _platform
from fabric import Config, Connection
from infrastructure.deploylib.environments import command, ssh_into, compose
from invoke import run

import os

color_cyan = '\033[96m'
color_white = '\033[0m'


def setup_default_env_vars():
    """
    Set the correct values for the .env.local file
    """
    variables = """APP_ENV=dev
SYMFONY_ENV=dev
APP_DEBUG=1

VAULT_URL=https://fake-url.com
VAULT_TOKEN=INSERT_A_REAL_SECRET

# If you want to enable address geolocation, set this variables
# https://developers.google.com/maps/documentation/javascript/get-api-key
# scopes: "Geocoding API", "Maps JavaScript API", "Places API"
SYMFONY_GOOGLE_MAP_PUBLIC_KEY=INSERT_A_REAL_SECRET
# scopes: "Geocoding API"
SYMFONY_GOOGLE_MAP_SERVER_KEY=INSERT_A_REAL_SECRET
# To enable map views, you need a mapbox account
# https://www.mapbox.com/
# with "tokens:read", "tokens:write" scopes
SYMFONY_MAPBOX_SECRET_KEY=INSERT_A_REAL_SECRET
SYMFONY_MAPBOX_PUBLIC_KEY=INSERT_A_REAL_SECRET

SYMFONY_REMEMBER_SECRET=INSERT_A_REAL_SECRET
SYMFONY_INSTANCE_REMEMBER_SECRET=INSERT_A_REAL_SECRET

# If you want to enable captcha, set the variables:
SYMFONY_RECAPTCHA_PRIVATE_KEY=INSERT_A_REAL_SECRET

SYMFONY_DATABASE_NAME=symfony

SYMFONY_ANONYMIZATION_INACTIVITY_DAYS=365
SYMFONY_ANONYMIZATION_INACTIVITY_EMAIL_REMINDER_DAYS=7

SYMFONY_MAILER_URL=smtp://127.0.0.1

# If you want to enable sms, set the variables:
# from https://console.twilio.com
SYMFONY_TWILIO_SID=INSERT_A_REAL_SECRET
SYMFONY_TWILIO_TOKEN=INSERT_A_REAL_SECRET
SYMFONY_TWILIO_DEFAULT_SUBACCOUNT_TOKEN=INSERT_A_REAL_SECRET
SYMFONY_TWILIO_DEFAULT_SUBACCOUNT_SID=INSERT_A_REAL_SECRET
SYMFONY_TWILIO_DEFAULT_VERIFY_SERVICE_ID=INSERT_A_REAL_SECRET
SYMFONY_TWILIO_DEFAULT_ALPHA_SENDER_ID=INSERT_A_REAL_SECRET
SYMFONY_TWILIO_DEFAULT_SERVICE_ID=INSERT_A_REAL_SECRET

SYMFONY_DISABLE_MAIL_DELIVERY=true
# If you set the variable SYMFONY_DISABLE_MAIL_DELIVERY to "false" to enable, set also the following variables:
SYMFONY_MANDRILL_API_KEY=INSERT_A_REAL_SECRET
SYMFONY_MAILJET_PUBLIC_KEY=INSERT_A_REAL_SECRET
SYMFONY_MAILJET_PRIVATE_KEY=INSERT_A_REAL_SECRET

# Facebook
SYMFONY_DEFAULT_FACEBOOK_CLIENT_ID=INSERT_A_REAL_SECRET
SYMFONY_DEFAULT_FACEBOOK_SECRET=INSERT_A_REAL_SECRET

# France Connect
# Tokens can be found here:
# https://partenaires.franceconnect.gouv.fr/monprojet/edition/e71799d4430405d19c2ab344c1c20421e94bf203af7ccaf714ad1858baa4d568
SYMFONY_DEFAULT_FRANCE_CONNECT_CLIENT_ID=INSERT_A_REAL_SECRET
SYMFONY_DEFAULT_FRANCE_CONNECT_CLIENT_SECRET=INSERT_A_REAL_SECRET

# SSO
SYMFONY_DEFAULT_OAUTH_CLIENT_ID=INSERT_A_REAL_SECRET
SYMFONY_DEFAULT_OAUTH_CLIENT_SECRET=INSERT_A_REAL_SECRET
SYMFONY_DEFAULT_OAUTH_AUTHORIZATION_URL=https://fake-url.com
SYMFONY_DEFAULT_OAUTH_ACCESS_TOKEN_URL=https://fake-url.com
SYMFONY_DEFAULT_OAUTH_USER_INFO_URL=https://fake-url.com
SYMFONY_DEFAULT_OAUTH_LOGOUT_URL=https://fake-url.com
SYMFONY_DEFAULT_OAUTH_PROFILE_URL=https://fake-url.com

SYMFONY_DEFAULT_REDIRECTIONIO_PROJECT_ID=INSERT_A_REAL_SECRET
SYMFONY_INSTANCE_SAML_PASSWORD=INSERT_A_REAL_SECRET

SYMFONY_CAS_CERTIFICATE_DIRECTORY=../app/config/cas

# Blackfire
BLACKFIRE_SERVER_ID=INSERT_A_REAL_SECRET
BLACKFIRE_SERVER_TOKEN=INSERT_A_REAL_SECRET
BLACKFIRE_CLIENT_ID=INSERT_A_REAL_SECRET
BLACKFIRE_CLIENT_TOKEN=INSERT_A_REAL_SECRET

# Host mapping
SYMFONY_DATABASE_HOST={host}
SYMFONY_REDIS_HOST={host}
SYMFONY_REDIS_PREFIX=dev
SYMFONY_ELASTICSEARCH_HOST={host}
SYMFONY_RABBITMQ_HOST={host}
SYMFONY_RABBITMQ_NODENAME={host}
SYMFONY_ASSETS_HOST={asset_host}

# ElasticSearch Cloudflare logpush traffic
SYMFONY_LOGPUSH_ELASTICSEARCH_HOST=INSERT_A_REAL_SECRET
SYMFONY_LOGPUSH_ELASTICSEARCH_PORT=INSERT_A_REAL_SECRET
SYMFONY_LOGPUSH_ELASTICSEARCH_INDEX=INSERT_A_REAL_SECRET
SYMFONY_LOGPUSH_ELASTICSEARCH_USERNAME=INSERT_A_REAL_SECRET
SYMFONY_LOGPUSH_ELASTICSEARCH_PASSWORD=INSERT_A_REAL_SECRET

# Sendinblue
SYMFONY_SENDINBLUE_API_KEY=INSERT_A_REAL_SECRET
# 12 is the ID of dev liste, the prod list is 3
SYMFONY_SENDINBLUE_NL_LIST_ID=12
SYMFONY_SENDINBLUE_SECRET=INSERT_A_REAL_SECRET

# OpenId BackChannel Access
SYMFONY_OPENID_BACKCHANNEL_SECRET=INSERT_A_REAL_SECRET
SYMFONY_OPENID_BACKCHANNEL_SECRET_DEV=INSERT_A_REAL_SECRET

# Loco read Key for translations - https://localise.biz/cap-collectif/cap-collectif
SYMFONY_LOCO_READ_ONLY_KEY=INSERT_A_REAL_SECRET

# Clefs Turnstile capco.dev
SYMFONY_TURNSTILE_PUBLIC_KEY=INSERT_A_REAL_SECRET
SYMFONY_TURNSTILE_PRIVATE_KEY=INSERT_A_REAL_SECRET
SYMFONY_MAGICLINKS_DURATION_IN_DAYS=0

# SMS One-Time-Password provider
SYMFONY_SMS_PROVIDER=orange
SYMFONY_ORANGE_API_CLIENT_ID=INSERT_A_REAL_SECRET
SYMFONY_ORANGE_API_CLIENT_SECRET=INSERT_A_REAL_SECRET
""" \
        .format(host=Config.local_ip, asset_host=Config.assets_host)
    print('Generating your default environment variables...')
    run('echo "%s" > .env.local' % variables)
    print(color_white + 'Created ' + color_cyan + '.env.local' + color_white + ' file')


def prepare_php(environment='dev'):
    "Prepare PHP"
    run('composer install --prefer-dist --no-interaction --ignore-platform-reqs --no-suggest --no-progress')
    run('php -d memory_limit=-1 bin/console graphql:compile')
    run('composer dump-autoload --optimize --apcu')
    run('php -d memory_limit=-1 bin/console cache:warmup --no-optional-warmers --env=' + environment)
    run('php -d memory_limit=-1 bin/console assets:install public --symlink --env=' + environment)


def deploy(environment='dev', user='capco', mode='symfony_bin'):
    "Deploy"
    if environment == 'dev':
        if _platform == 'darwin' and mode == 'symfony_bin':
            setup_default_env_vars()
        print(color_cyan + 'Successfully downloaded dependencies.' + color_white)
        prepare_php()
    command('rm -rf var/cache/dev var/cache/prod var/cache/test', 'application', Config.www_app, 'root')
    rabbitmq_queues()
    command('php -d memory_limit=-1 bin/console cache:warmup --no-optional-warmers --env=' + environment, 'application', Config.www_app)
    if os.environ.get('CI') == 'true':
        command('chmod -R 777 /var/www/public', 'application', Config.www_app, 'root')
    command('php bin/console assets:install public --symlink', 'application', Config.www_app)
    if environment == 'dev':
        # We need to configure node-sass for local builds without Docker
        run('npm rebuild node-sass')
        print(color_cyan + 'Successfully deployed https://capco.dev ! Last step is to generate your database with "local.database.generate"' + color_white)


def toggle_enable(toggle='public_api', environment='test'):
    "Enable a feature toggle."
    command('php bin/console capco:toggle:enable ' + toggle + ' --no-interaction --env=' + environment, 'application', Config.www_app, "capco", False)


def toggle_disable(toggle='public_api', environment='test'):
    "Disable a feature toggle."
    command('php bin/console capco:toggle:disable ' + toggle + ' --no-interaction --env=' + environment, 'application', Config.www_app, "capco", False)


def clean():
    "Clean"
    compose('stop chrome || true')
    compose('rm -f chrome')


def rabbitmq_queues():
    "Create RabbitMQ queues"
    command('php bin/rabbit vhost:mapping:create --vhost=${SYMFONY_RABBITMQ_VHOST:-capco}  --user=${SYMFONY_RABBITMQ_LOGIN:-guest} --password=${SYMFONY_RABBITMQ_PASSWORD:-guest} --erase-vhost config/rabbitmq.yaml', 'application', Config.www_app)


def start_consumers():
    "Start consumers"
    command('if pgrep supervisord; then pkill supervisord; sleep 3; fi', 'application', Config.www_app, 'root')
    command('supervisord --configuration=/etc/supervisord/supervisord.conf', 'application', Config.www_app, 'root')

def swarrot_consume(name):
    "Consume rabbitmq queue"
    command('php -d memory_limit=-1 bin/console swarrot:consume:' + name + ' ' + name, 'application', Config.www_app, 'capco')


def stop_consumers():
    "Stop consumers"
    command('if pgrep supervisord; then pkill supervisord; sleep 3; fi', 'application', Config.www_app, 'root')


def ssh(user='capco'):
    "Ssh into application container"
    ssh_into('application', user)


def clear_cache(environment='dev'):
    "Clear cache"
    command('rm -rf var/cache/' + environment, 'application', Config.www_app, 'root')
    command('php -d memory_limit=-1 bin/console cache:pool:clear cache.app --no-debug', 'application', Config.www_app, 'capco')


def cmd(commandName='', environment='dev'):
    "Executing Symfony command"
    command('php -d memory_limit=-1 bin/console ' + commandName + ' --no-interaction --env=' + environment, 'application', Config.www_app, 'root')

def sql(sql='', environment='dev'):
    "Executing SQL command"
    sql = sql.replace('"', '\\\\\\"')
    command('php -d memory_limit=-1 bin/console doctrine:query:sql \\"' + sql + '\\" --no-interaction --env=' + environment, 'application', Config.www_app, 'root')
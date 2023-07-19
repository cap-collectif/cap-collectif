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
# If you want to enable address geolocation, set this variables
# https://developers.google.com/maps/documentation/javascript/get-api-key
SYMFONY_GOOGLE_MAP_PUBLIC_KEY=INSERT_A_REAL_SECRET
SYMFONY_GOOGLE_MAP_SERVER_KEY=INSERT_A_REAL_SECRET
# To enable map views, you need a mapbox access token
# https://www.mapbox.com/
# with "tokens:read", "tokens:write" scopes
SYMFONY_MAPBOX_SECRET_KEY=INSERT_A_REAL_SECRET
SYMFONY_MAPBOX_PUBLIC_KEY=INSERT_A_REAL_SECRET

SYMFONY_INSTANCE_REMEMBER_SECRET=INSERT_A_REAL_SECRET

# If you want to enable captcha, set the variables:
SYMFONY_RECAPTCHA_PRIVATE_KEY=INSERT_A_REAL_SECRET

# If you want to enable sms, set the variables:
SYMFONY_TWILIO_SID=INSERT_A_REAL_SECRET
SYMFONY_TWILIO_TOKEN=INSERT_A_REAL_SECRET
SYMFONY_TWILIO_DEFAULT_SUBACCOUNT_TOKEN=INSERT_A_REAL_SECRET
SYMFONY_TWILIO_DEFAULT_SUBACCOUNT_SID=INSERT_A_REAL_SECRET
SYMFONY_TWILIO_DEFAULT_VERIFY_SERVICE_ID=INSERT_A_REAL_SECRET

# If you want to enable emails, set the variables:
SYMFONY_DISABLE_MAIL_DELIVERY=false
SYMFONY_MANDRILL_API_KEY=INSERT_A_REAL_SECRET
SYMFONY_MAILJET_PUBLIC_KEY=INSERT_A_REAL_SECRET
SYMFONY_MAILJET_PRIVATE_KEY=INSERT_A_REAL_SECRET
SYMFONY_SENDINBLUE_API_KEY=INSERT_A_REAL_SECRET
SYMFONY_SENDINBLUE_NL_LIST_ID=INSERT_A_REAL_SECRET
SYMFONY_SENDINBLUE_SECRET=INSERT_A_REAL_SECRET

# If you want to enable openid backchannel, set the variables:
SYMFONY_OPENID_BACKCHANNEL_SECRET=INSERT_A_REAL_SECRET

# Host mapping
SYMFONY_DATABASE_HOST={host}
SYMFONY_REDIS_HOST={host}
SYMFONY_ELASTICSEARCH_HOST={host}
SYMFONY_RABBITMQ_HOST={host}
SYMFONY_RABBITMQ_NODENAME={host}
SYMFONY_ASSETS_HOST={asset_host}""" \
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

def stop_consumers():
    "Stop consumers"
    command('if pgrep supervisord; then pkill supervisord; sleep 3; fi', 'application', Config.www_app, 'root')

def ssh(user='capco'):
    "Ssh into application container"
    ssh_into('application', user)


def clear_cache(environment='dev'):
    "Clear cache"
    command('rm -rf var/cache/' + environment, 'application', Config.www_app, 'root')
    command('php -d memory_limit=-1 bin/console cache:pool:clear cache.app', 'application', Config.www_app, 'capco')


def cmd(commandName='', environment='dev'):
    "Executing Symfony command"
    command('php -d memory_limit=-1 bin/console ' + commandName + ' --no-interaction --env=' + environment, 'application', Config.www_app, 'root')

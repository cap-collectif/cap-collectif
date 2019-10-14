from task import task
from fabric.operations import local, run, settings
from fabric.api import env
from fabric.colors import cyan
from sys import platform as _platform

import os


@task(environments=['local'])
def setup_env_vars():
    """
    Set the correct values for the .env.local file
    """
    asset_host = 'assets.cap.co'
    variables = """SYMFONY_DATABASE_HOST={host}
SYMFONY_REDIS_HOST={host}
SYMFONY_ELASTICSEARCH_HOST={host}
SYMFONY_RABBITMQ_HOST={host}
SYMFONY_ASSETS_HOST={asset_host}""" \
        .format(host=env.local_ip, asset_host=asset_host)
    local('echo "%s" >> .env.local' % variables)

@task(environments=['local', 'ci'])
def deploy(environment='dev', user='capco', mode='symfony_bin'):
    "Deploy"
    if os.environ.get('CI') == 'true':
        env.compose('run -u root qarunner chown capco:capco -R /var/www/web')
        local('sudo chmod -R 777 .')
    if environment == 'dev':
        if _platform == 'darwin' and mode == 'symfony_bin':
            setup_env_vars()
        local('yarn run fonts')
        print cyan('Successfully downloaded latests fonts.')
    env.compose('run' + ('', ' -e PRODUCTION=true')[environment == 'prod'] + ('', ' -e CI=true')[os.environ.get('CI') == 'true'] + ' builder build')
    print cyan('Successfully downloaded dependencies.')
    env.service_command('php vendor/sensio/distribution-bundle/Resources/bin/build_bootstrap.php var', 'application', env.www_app)
    env.service_command('rm -rf var/cache/dev var/cache/prod var/cache/test', 'application', env.www_app, 'root')
    rabbitmq_queues()
    env.service_command('php bin/console simplesamlphp:config --no-interaction --env=' + environment, 'application', env.www_app)
    env.service_command('php bin/console cache:warmup --no-optional-warmers --env=' + environment, 'application', env.www_app)
    env.service_command('php bin/console assets:install --symlink', 'application', env.www_app)
    if environment == 'dev':
        # We need to configure node-sass for local builds without Docker
        local('npm rebuild node-sass')
        print cyan('Successfully deployed https://capco.dev ! Last step is to generate your database with "local.database.generate"')


@task(environments=['local', 'ci'])
def toggle_enable(toggle='public_api', environment='test'):
    "Enable a feature toggle."
    env.service_command('php bin/console capco:toggle:enable ' + toggle + ' --env=' + environment, 'application', env.www_app)


@task(environments=['ci'])
def build(environment='prod', user='capco'):
    "Build"
    if os.environ.get('CI') == 'true':
        local('sudo chmod -R 777 .')
    env.compose('run' + ('', ' -e PRODUCTION=true')[environment == 'prod'] + ('', ' -e CI=true')[os.environ.get('CI') == 'true'] + ' builder build')
    env.service_command('php vendor/sensio/distribution-bundle/Resources/bin/build_bootstrap.php var', 'application', env.www_app)
    env.service_command('rm -rf var/cache/dev var/cache/prod var/cache/test', 'application', env.www_app, 'root')
    env.service_command('php bin/console cache:warmup --no-optional-warmers --env=' + environment, 'application', env.www_app)
    env.service_command('php bin/console assets:install --symlink --env=' + environment, 'application', env.www_app)


@task(environments=['local'])
def clean():
    "Clean"
    env.compose('stop chrome || true')
    env.compose('rm -f chrome')


@task(environments=['local', 'ci'])
def rabbitmq_queues():
    "Create RabbitMQ queues"
    env.service_command('php bin/rabbit vhost:mapping:create --password=guest --erase-vhost app/config/rabbitmq.yml', 'application', env.www_app)


@task(environments=['local', 'ci'])
def start_consumers():
    "Start consumers"
    env.service_command('if pgrep supervisord; then pkill supervisord; fi', 'application', env.www_app, 'root')
    env.service_command('supervisord --configuration=/etc/supervisord/supervisord.conf', 'application', env.www_app, 'root')


@task(environments=['local'])
def ssh(user='capco'):
    "Ssh into application container"
    env.ssh_into('application', user)


@task(environments=['local'])
def clear_cache(environment='dev'):
    "Clear cache"
    env.service_command('rm -rf var/cache/' + environment, 'application', env.www_app, 'root')
    env.service_command('bin/console cache:pool:clear cache.app', 'application', env.www_app, 'capco')


@task(environments=['local'])
def cmd(command='', environment='dev'):
    "Executing Symfony command"
    env.service_command('php -d memory_limit=-1 bin/console ' + command + ' --no-interaction --env=' + environment, 'application', env.www_app, 'root')

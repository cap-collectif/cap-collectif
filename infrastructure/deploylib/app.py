from task import task
from fabric.operations import local, run, settings
from fabric.api import env


@task
def deploy(environment='dev'):
    "Deploy"
    env.compose('run' + ('', ' -e PRODUCTION=true')[environment == 'prod'] + ' builder build')
    env.service_command('php vendor/sensio/distribution-bundle/Resources/bin/build_bootstrap.php var', 'application', env.www_app)
    env.service_command('rm -rf var/cache/dev var/cache/prod var/cache/test', 'application', env.www_app, 'root')
    env.service_command('php bin/rabbit vhost:mapping:create --password=guest --erase-vhost app/config/rabbitmq.yml', 'application', env.www_app)
    env.service_command('php bin/console simplesamlphp:config --no-interaction', 'application', env.www_app)
    env.service_command('php bin/console cache:warmup --no-optional-warmers --env=' + environment, 'application', env.www_app)
    env.service_command('php bin/console assets:install --symlink', 'application', env.www_app)


@task
def ssh(user='capco'):
    "Ssh into application container"
    env.ssh_into('application', user)


@task
def clear_cache(environment='dev'):
    "Clear cache"
    env.service_command('rm -rf var/cache/' + environment, 'application', env.www_app, 'root')

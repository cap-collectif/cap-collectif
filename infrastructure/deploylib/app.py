from task import task
from fabric.operations import local, run, settings
from fabric.api import env


@task
def deploy(environment='dev'):
    "Deploy frontend"
    build_deps(environment)
    build_front(environment)


@task
def build_deps(environment='dev'):
    "Build frontend deps"
    env.compose_run('composer install --no-interaction --prefer-dist --no-scripts', 'builder', '.', 'capco', no_deps=True)
    env.service_command('php vendor/sensio/distribution-bundle/Sensio/Bundle/DistributionBundle/Resources/bin/build_bootstrap.php var', 'application', env.www_app)
    env.service_command('rm -rf app/cache/dev app/cache/prod', 'application', env.www_app)
    env.service_command('php app/console assets:install', 'application', env.www_app)
    env.compose_run('npm install' + ('', ' --production')[environment == 'prod'], 'builder', '.', 'capco', no_deps=True)

@task
def build_front(environment='dev'):
    "Build frontend"
    env.compose_run('./node_modules/.bin/brunch build'+ ('', ' --production')[environment == 'prod'], 'builder', '.', 'capco', no_deps=True)

@task
def ssh():
    "Ssh into application container"
    env.ssh_into('application')

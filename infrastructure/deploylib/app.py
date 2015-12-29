from task import task
from fabric.operations import local, run, settings
from fabric.api import env

@task
def deploy(environment='dev'):
    "Deploy"
    env.compose('run builder build')
    env.service_command('php vendor/sensio/distribution-bundle/Sensio/Bundle/DistributionBundle/Resources/bin/build_bootstrap.php var', 'application', env.www_app)
    env.service_command('rm -rf var/cache/dev var/cache/prod', 'application', env.www_app)
    env.service_command('php bin/console cache:warmup --no-optional-warmers --env=prod', 'application', env.www_app)
    env.service_command('php bin/console assets:install --symlink', 'application', env.www_app)

@task
def ssh():
    "Ssh into application container"
    env.ssh_into('application')

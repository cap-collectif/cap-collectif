from task import task
from fabric.operations import local, run, settings
from fabric.api import env


@task(environments=['local', 'testing'])
def checkcs():
    "Check code style"
    env.compose_run('php-cs-fixer fix --level=symfony --dry-run --diff src || echo ""', 'builder', '.', no_deps=True)


@task(environments=['local', 'testing'])
def lint():
    "Lint twig and yaml files"
    env.compose_run('php app/console lint:twig app/', 'builder', '.', no_deps=True)


@task(environments=['local', 'testing'])
def behat():
    "Run Gerhkin Tests"
    env.compose_run('bin/phpspec run --no-code-generation', 'builder', '.')
    env.service_command('bin/behat -s api', 'application', '.')      # to fix
    env.service_command('bin/behat -s commands', 'application', '.') # to fix
    env.service_command('bin/behat -s front', 'application', '.')    # to fix

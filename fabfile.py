from __future__ import with_statement

import os

from fabric.api import *
from fabric.context_managers import lcd
from fabric.colors import red, green

env.local_dir = env.real_fabfile[:-10]

@task
def build_deps(environment='dev'):
    with lcd(env.local_dir):
        local('npm install' + ('', ' --production')[environment == 'prod'])
        local('bower install --config.interactive=false')
        local('composer install --prefer-dist --no-interaction --optimize-autoloader')

@task
def build_front(environment='dev'):
    with lcd(env.local_dir):
        local('brunch build'+ ('', ' --production')[environment == 'prod'])

@task
def build_test_db():
    with lcd(env.local_dir):
        local('php app/console doctrine:schema:update --force -e test')

@task
def reinit_data():
    with lcd(env.local_dir):
        local('php app/console capco:reinit --force')

@task
def lint():
    with lcd(env.local_dir):
        with settings(warn_only=True):
            result = local('./php-cs-fixer fix . --config=sf23 --dry-run', capture=True)

            if result.return_code == 0:
                print(green('PHP: OK'))
            elif result.return_code == 1:
                print result
                print(red('PHP: /!\ You should fix your PHP files!'))
            else:
                print result
                raise SystemExit()

@task
def test():
    with lcd(env.local_dir):
        local('bin/phpspec run --no-code-generation', capture=False)
        local('bin/behat -s api', capture=False)
        local('bin/behat -s commands', capture=False)
        local('bin/behat -s front', capture=False)

@task
def build(environment='dev'):
    build_deps(environment);
    build_front(environment);

@task
def docker_import_bdd():
    local('eval "$(docker-machine env capco)" && cat dump.sql | docker exec -i capcollectifsf2_application_1 /bin/bash -c "mysql -u root symfony"')

@task
def runner():
    local('docker exec -ti capcollectifsf2_application_1 bash')

@task
def csfixer():
    local('php-cs-fixer fix . --config=sf23 --fixers=align_double_arrow,short_array_syntax,align_equals -v', capture=False)

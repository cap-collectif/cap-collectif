from __future__ import with_statement
from infrastructure.deploylib import environments, task
from infrastructure.deploylib import infrastructure, system, app, circle, qa, database
from fabric.api import local


#
#@task
#def build_test_db():
#    with lcd(env.local_dir):
#        local('php app/console doctrine:schema:update --force -e test')
#
#@task
#def reinit_data():
#    with lcd(env.local_dir):
#        local('php app/console capco:reinit --force')
#
#@task
#def lint():
#    with lcd(env.local_dir):
#        with settings(warn_only=True):
#            result = local('./php-cs-fixer fix . --config=sf23 --dry-run', capture=True)
#
#            if result.return_code == 0:
#                print(green('PHP: OK'))
#            elif result.return_code == 1:
#                print result
#                print(red('PHP: /!\ You should fix your PHP files!'))
#            else:
#                print result
#                raise SystemExit()
#
#@task
#def test():
#    with lcd(env.local_dir):
#        local('bin/phpspec run --no-code-generation', capture=False)
#        local('bin/behat -s api', capture=False)
#        local('bin/behat -s commands', capture=False)
#        local('bin/behat -s front', capture=False)
#

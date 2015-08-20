from __future__ import with_statement

import requests
import os

from fabric.api import *
from fabric.context_managers import lcd
from fabric.colors import red, green
from libsaas.services import github

GH_USER  = 'jolicode'
REPO     = 'CapCollectif-SF2'

env.circleci  = False
env.local_dir = env.real_fabfile[:-10]

@task
def circleci():
    env.circleci = True
    env.gh_token = os.environ['GH_TOKEN']

def create_PR_comment(type, result, pr):
    if os.getenv('GH_TOKEN', True):
        try:
            prId      = int(pr.split('/')[-1])
            gh_client = github.Github(env.gh_token)
            gh_pr     = gh_client.repo(GH_USER, REPO).issue(prId).comments().create('Warning: You should check your '+type+' files.\n '+result)
        except ValueError:
            print 'Can\'t retrieve pr id'

@task
def build_deps():
    with lcd(env.local_dir):
        local('npm install')
        local('bower install --config.interactive=false')
        local('composer install --prefer-dist --no-interaction --optimize-autoloader')

@task
def build_front():
    with lcd(env.local_dir):
        local('brunch build --production')

@task
def build_test_db():
    with lcd(env.local_dir):
        local('php app/console doctrine:schema:update --force -e test')

@task
def migrate_test_db():
    with lcd(env.local_dir):
        local('php app/console doctrine:migration:migrate -n -e test')

@task
def load_base_data():
    with lcd(env.local_dir):
        local('php app/console capco:load-base-data --force -n -e test')

@task
def validate_test_schema():
    with lcd(env.local_dir):
        local('php app/console doctrine:schema:validate --test')

@task
def reinit_data():
    with lcd(env.local_dir):
        local('php app/console capco:reinit --force')

@task
def lint(pr=''):
    with lcd(env.local_dir):
        with settings(warn_only=True):
            result = local('./php-cs-fixer fix . --config=sf23 --dry-run', capture=True)

            if result.return_code == 0:
                print(green('PHP: OK'))
            elif result.return_code == 1:
                print result
                print(red('PHP: /!\ You should fix your PHP files!'))

                if env.circleci:
                    create_PR_comment('PHP', result, pr)
            else: #print error to user
                print result
                raise SystemExit()

@task
def test():
    with lcd(env.local_dir):
        local('bin/phpspec run --no-code-generation', capture=False)
        local('bin/behat -s api', capture=False)
        local('bin/behat -s front', capture=False)

@task
def build():
    build_deps();
    build_front();

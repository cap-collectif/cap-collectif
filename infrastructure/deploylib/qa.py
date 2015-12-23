from task import task
from fabric.operations import local, run, settings
from fabric.api import env


@task(environments=['local', 'testing'])
def checkcs():
    "Check code style"
    env.compose_run('php-cs-fixer fix --level=symfony --dry-run --diff src || echo ""', 'builder', '.', no_deps=True)
    local('pep8 infrastructure/deploylib --ignore=E501')

@task(environments=['local'])
def fix_cs_file(file, dry_run=False):
    "Fix code style for one file"
    if dry_run:
        env.compose_run('php-cs-fixer fix --config-file=.php_cs --dry-run --diff %s' % file, 'builder', 'capco', no_deps=True)
    else:
        env.compose_run('php-cs-fixer fix --config-file=.php_cs %s' % file, 'builder', 'capco', no_deps=True)

@task(environments=['local', 'testing'])
def lint():
    "Lint twig and yaml files"
    env.service_command('php bin/console lint:twig app/', 'application', env.www_app)

@task(environments=['local', 'testing'])
def phpspec():
    "Run Unit Tests"
    env.service_command('./bin/phpspec run --no-code-generation', 'application', env.www_app)

@task(environments=['local', 'testing'])
def behat(fast_failure='true'):
    "Run Gerhkin Tests"
    if not env.lxc:
        env.service_command('docker pull spyl94/capco-fixtures:latest', 'application')
    #env.service_command('php -d memory_limit=-1 ./bin/behat -p api'+ ('', '  --stop-on-failure')[fast_failure == 'true'], 'application', env.www_app)
    #env.service_command('php -d memory_limit=-1 ./bin/behat -p commands'+ ('', '  --stop-on-failure')[fast_failure == 'true'], 'application', env.www_app)
    #env.service_command('php -d memory_limit=-1 ./bin/behat -p frontend' + ('', '  --stop-on-failure')[fast_failure == 'true'], 'application', env.www_app)
    # kill_database_container()
    # clear_fixtures()
    env.service_command('php -d memory_limit=-1 ./bin/behat -p javascript' + ('', '  --stop-on-failure')[fast_failure == 'true'], 'application', env.www_app)
    clear_fixtures()

@task(environments=['local'])
def view():
  local('echo "secret" | open vnc://`docker-machine ip capco`::5900')

def clear_fixtures():
    local('docker ps -a | awk \'{ print $1,$2 }\' | grep spyl94/capco | awk \'{print $1 }\' | xargs -I {} docker rm -f {}')

def kill_database_container():
    with settings(warn_only=True):
        local('docker kill capco_databasefixtures_1')

# Improve this, but okay for now...
# tag should be the current commit ?
@task(environments=['local'])
def save_fixtures_image(tag='latest'):
    "Publish a new fixtures image"
    env.service_command('php bin/console capco:reinit --force', 'application', env.www_app)
    env.service_command('mysqldump -h database -uroot --opt symfony > infrastructure/services/databasefixtures/dump.sql', 'application', env.www_app, 'root')
    env.compose('build databasefixtures')
    image_id = local('docker images | grep capco_databasefixtures | awk \'{print $3}\'', capture=True)
    local('docker tag -f '+ image_id +' spyl94/capco-fixtures:'+tag)
    local('docker login --username=spyl94')
    local('docker push spyl94/capco-fixtures')

@task(environments=['local'])
def setup_git_hooks():
    "Set git hooks"
    local('rm -f .git/hooks/pre-commit && ln -s ../../infrastructure/git-hooks/hooks/pre-commit .git/hooks/pre-commit')

@task(environments=['local'])
def run_pre_commit_hook():
    "Run pre-commit hook"
    env.compose_run('infrastructure/git-hooks/scripts/cs-fixer.sh', 'builder', 'capco', '/var/www', no_deps=True)
    env.compose_run('infrastructure/git-hooks/scripts/pep8.sh', 'builder', 'capco', '/var/www', no_deps=True)

from task import task
from fabric.operations import local, run, settings
from fabric.api import env
import time

capcobot = {
    'user': 'capco',
    'email': 'capco.bot@gmail.com',
    'pass': 'elephpant-can-fly',
}


@task(environments=['local', 'ci'])
def scan_vulnerabilities():
    "Check dependencies"
    env.compose_run('composer validate', 'qarunner', '.', no_deps=True)
    env.service_command('bin/console security:check', 'application', env.www_app)


@task(environments=['local', 'ci'])
def check_codestyle():
    "Check code style"
    env.compose_run('yarn run checkcs', 'qarunner', '.')
    env.compose_run('pycodestyle infrastructure/deploylib --ignore=E501,W605', 'qarunner', '.', no_deps=True)
    env.service_command('php bin/console lint:twig app src', 'application', env.www_app)


@task(environments=['local'])
def lint():
    "Lint all files"
    env.compose_run('yarn run lint', 'qarunner', '.', no_deps=True)
    env.compose_run('yarn run graphql:lint:public', 'qarunner', '.', no_deps=True)
    env.compose_run('pycodestyle infrastructure/deploylib --ignore=E501,W605', 'qarunner', '.', no_deps=True)


@task(environments=['local', 'ci'])
def static_analysis():
    "Run static analysis tools"
    env.compose_run('yarn run flow', 'qarunner', '.', no_deps=True)
    env.compose_run('yarn run flow:coverage', 'qarunner', '.', no_deps=True)
    env.service_command('php -d memory_limit=-1 bin/phpstan analyse src -l 2 -c phpstan.neon', 'application', env.www_app)


@task(environments=['local', 'ci'])
def phpspec():
    "Run PHP Unit Tests"
    env.service_command('phpenmod xdebug', 'application', env.www_app, 'root')
    env.service_command('php -d memory_limit=-1 bin/phpspec run --no-code-generation --no-coverage', 'application', env.www_app)
    env.service_command('phpdismod xdebug', 'application', env.www_app, 'root')


@task(environments=['local', 'ci'])
def phpspec_coverage():
    "Run PHP Unit Tests"
    env.service_command('phpenmod xdebug', 'application', env.www_app, 'root')
    env.service_command('php -d memory_limit=-1 bin/phpspec run --no-code-generation', 'application', env.www_app)
    env.service_command('phpdismod xdebug', 'application', env.www_app, 'root')


@task(environments=['local', 'ci'])
def jest():
    "Run JS Unit Tests"
    env.compose('run -e CI=true qarunner yarn test:ci')


@task(environments=['ci'])
def perf():
    "Run perf Tests"
    env.compose('run -e CI=true -e CIRCLECI -e CIRCLE_PROJECT_USERNAME -e CIRCLE_PROJECT_REPONAME -e CIRCLE_SHA1 -e CIRCLE_BRANCH qarunner yarn run bundlesize')


@task(environments=['ci'])
def codecov():
    "Upload code coverage"
    env.compose('run -e CI=true -e CIRCLECI -e CIRCLE_PROJECT_USERNAME -e CIRCLE_PROJECT_REPONAME -e CIRCLE_SHA1 -e CIRCLE_BRANCH qarunner yarn run codecov --file=coverage/php/clover.xml --flags=graphql')
    env.compose('run -e CI=true -e CIRCLECI -e CIRCLE_PROJECT_USERNAME -e CIRCLE_PROJECT_REPONAME -e CIRCLE_SHA1 -e CIRCLE_BRANCH qarunner yarn run codecov --file=coverage/php/clover.xml --flags=php')
    env.compose('run -e CI=true -e CIRCLECI -e CIRCLE_PROJECT_USERNAME -e CIRCLE_PROJECT_REPONAME -e CIRCLE_SHA1 -e CIRCLE_BRANCH qarunner yarn run codecov --file=coverage/js/lcov.info --flags=jest')
# TODO:  https://github.com/rpl/flow-coverage-report/issues/67
#    env.compose('run -e CI=true -e CIRCLECI -e CIRCLE_PROJECT_USERNAME -e CIRCLE_PROJECT_REPONAME -e CIRCLE_SHA1 -e CIRCLE_BRANCH qarunner yarn run codecov -f ./coverage/flow/index.html -c --flags=flow')


@task(environments=['local', 'ci'])
def behat(fast_failure='true', profile=False, tags='false', feature='false', parallel='false', timer='true'):
    "Run Gerhkin Tests"
    env.service_command('mysqldump --opt -h database -u root symfony > var/db.backup', 'application', env.www_app)
    if profile:
        jobs = [profile]
    else:
        jobs = ['api', 'commands', 'frontend', 'javascript', 'graphql', 'back']

    for job in jobs:
        command = 'php -d memory_limit=-1 ./bin/behat' + ('', ' --log-step-times')[timer != 'false'] + ('', ' --parallel-process 10')[parallel != 'false'] + ' -p ' + job + ('', '  --tags=' + tags)[tags != 'false'] + ('', '  --stop-on-failure')[fast_failure == 'true'] + ('', ' --name ' + feature)[feature != 'false']
        env.service_command(command, 'application', env.www_app)


@task(environments=['local'])
def view():
    if env.dinghy:
        local('echo "secret" | open vnc://`docker-machine ip dinghy`')
    else:
        local('echo "secret" | nohup vncviewer localhost:5900 &')


@task(environments=['local'])
def clear_fixtures():
    local('docker ps -a | awk \'{ print $1,$2 }\' | grep capco/fixtures | awk \'{print $1 }\' | xargs -I {} docker rm -f {}')


@task(environments=['local'])
def kill_database_container():
    with settings(warn_only=True):
        local('docker ps -a | grep databasefixtures | awk \'{print $1}\' | xargs -I {} docker kill {}')


@task(environments=['local'])
def save_fixtures_image(tag='latest', publish='false'):
    "Publish a new fixtures image"
    env.service_command('php bin/console capco:reinit --force --no-toggles', 'application', env.www_app)
    env.service_command('mysqldump -h database -uroot --opt symfony > infrastructure/services/databasefixtures/dump.sql', 'application', env.www_app, 'root')
    local('docker build -t capco/fixtures:latest infrastructure/services/databasefixtures')
    if publish != 'false':
        local('docker login -e ' + capcobot['email'] + ' -u ' + capcobot['user'] + ' -p ' + capcobot['pass'])
        local('docker push capco/fixtures')


@task(environments=['local'])
def blackfire_curl(url):
    "Blackfire curl"
    local('eval "$(docker-machine env dinghy)" && docker exec -i capco_application_1 blackfire curl ' + url + ' --env="Cap Collectif"')


@task(environments=['local'])
def blackfire_run(cli):
    "Blackfire run"
    local('eval "$(docker-machine env dinghy)" && docker exec -u root -i capco_application_1 blackfire run ' + cli + ' --env="Cap Collectif"')

from task import task
from fabric.operations import local, run, settings
from fabric.api import env
import time

capcobot = {
    'user': 'capco',
    'email': 'capco.bot@gmail.com',
    'pass': 'elephpant-can-fly',
}


# Usage:
#
# Runn tests: fab local.qa.phpspec
#
# Create a new spec from existing class :
# fab local.qa.phpspec:desc=Capco/AppBundle/GraphQL/Resolver/Questionnaire/QuestionnaireExportResultsUrlResolver
#
@task(environments=['local'])
def phpspec(desc=False):
    "Run PHP Unit Tests"
    if desc:
        env.service_command('phpdbg -qrr bin/phpspec describe ' + desc, 'application', env.www_app)
    else:
        env.service_command('phpdbg -qrr bin/phpspec run --no-code-generation --no-coverage', 'application', env.www_app)


@task(environments=['ci'])
def perf():
    "Run perf Tests"
    env.compose('run -e CI=true -e CIRCLECI -e CIRCLE_PROJECT_USERNAME -e CIRCLE_PROJECT_REPONAME -e CIRCLE_SHA1 -e CIRCLE_BRANCH qarunner yarn run bundlesize')


@task(environments=['local','ci'])
def graphql_schemas(checkSame=False):
    "Generate GraphQL schemas"
    for schema in ['public', 'preview', 'internal']:
        env.service_command('bin/console graphql:dump-schema --env dev --schema ' + schema + ' --no-debug --file schema.'+schema+'.graphql --format graphql', 'application', env.www_app)
    if checkSame:
        local('if [[ $(git diff -G. --name-only *.graphql | wc -c) -ne 0 ]]; then git --no-pager diff *.graphql && echo "\n\033[31mThe following schemas are not up to date:\033[0m" && git diff --name-only *.graphql && echo "\033[31mYou should run \'yarn generate-graphql-files\' to update your *.graphql files !\033[0m" && exit 1; fi',  capture=False, shell='/bin/bash')

@task(environments=['local'])
def snapshots(emails=False):
    env.service_command('mysqldump --opt -h database -u root symfony > var/db.backup', 'application', env.www_app)
    commands = [
        'capco:export:users --quiet --snapshot',
        'capco:export:consultation --quiet --snapshot',
        'capco:export:projects-contributors --quiet --snapshot',
        'capco:export:proposalStep --quiet --snapshot',
        # 'capco:export:questionnaire --snapshot',
    ]
    extensions = [
        'csv',
        'xlsx',
        'xls',
    ]

    if emails:
        local('rm -rf src/Capco/AppBundle/Behat/snapshots/*')
        env.service_command('SNAPSHOTS=true php -d memory_limit=-1 ./bin/behat -p api --tags=snapshot', 'application', env.www_app)
        env.service_command('SNAPSHOTS=true php -d memory_limit=-1 ./bin/behat -p e2e --tags=snapshot', 'application', env.www_app)
        env.service_command('SNAPSHOTS=true php -d memory_limit=-1 ./bin/behat -p commands --tags=snapshot', 'application', env.www_app)

    env.service_command('bin/console capco:toggle:enable export --env test --no-debug', 'application', env.www_app)
    for extension in extensions:
        env.service_command('rm -rf var/www/web/export/*.' + extension , 'application', env.www_app, 'root')

    for command in commands:
        env.service_command('bin/console ' + command + ' --env test --no-debug', 'application', env.www_app)

    env.service_command('rm -rf var/www/features/commands/__snapshots__/*', 'application', env.www_app, 'root')
    for extension in extensions:
        env.service_command('cp web/export/*.' + extension + ' features/commands/__snapshots__/ 2>/dev/null || :', 'application', env.www_app)

@task(environments=['local', 'ci'])
def behat(fast_failure='true', profile=False, suite='false', tags='false', timer='true'):
    "Run Gherkin Tests"
    env.service_command('mysqldump --opt -h database -u root symfony > var/db.backup', 'application', env.www_app)
    if profile:
        profiles = [profile]
    else:
        profiles = ['api', 'commands', 'e2e']

    for job in profiles:
        command = ('php -d memory_limit=-1 ./bin/behat'
            + ('', ' --log-step-times')[timer != 'false']
            + ' -p ' + job
            + ('', '  --suite=' + suite)[suite != 'false']
            + ('', '  --tags=' + tags)[tags != 'false']
            + ('', '  --stop-on-failure')[fast_failure == 'true'])
        env.service_command(command, 'application', env.www_app, 'root')


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

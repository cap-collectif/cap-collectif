from fabric import Config, Connection
from infrastructure.deploylib.environments import command
from invoke import run

import os

capcobot = {
    'user': 'capco',
    'email': 'capco.bot@gmail.com',
    'pass': 'elephpant-can-fly',
}

color_cyan = '\033[96m'
color_white = '\033[0m'


# Usage:
#
# Run tests: fab local.qa.phpspec
#
# Create a new spec from existing class :
# fab local.qa.phpspec:desc=Capco/AppBundle/GraphQL/Resolver/Questionnaire/QuestionnaireExportResultsUrlResolver
#
def phpspec(desc='false'):
    "Run PHP Unit Tests"
    if desc != 'false':
        command(
            'php -d pcov.enabled=1 -d pcov.directory=. -d pcov.exclude="~vendor~" -d memory_limit=-1 bin/phpspec describe ' + desc,
            'application', Config.www_app)
    else:
        command(
            'php -d pcov.enabled=1 -d pcov.directory=. -d pcov.exclude="~vendor~" -d memory_limit=-1 bin/phpspec run --no-code-generation --no-coverage',
            'application', Config.www_app)


def compile_graphql():
    "Compile GraphQL PHP code"
    run('php -d memory_limit=-1 bin/console graphql:compile --no-debug')
    run('composer dump-autoload')


def graphql_schemas(checkSame=False):
    "Generate GraphQL schemas"
    for schema in ['public', 'preview', 'internal']:
        command(
            'bin/console graphql:dump-schema --env dev --schema ' + schema + ' --no-debug --file schema.' + schema + '.graphql --format graphql',
            'application', Config.www_app)
    if checkSame:
        command(
            'if [[ $(git diff -G. --name-only *.graphql | wc -c) -ne 0 ]]; then git --no-pager diff *.graphql && echo "\n\033[31mThe following schemas are not up to date:\033[0m" && git diff --name-only *.graphql && echo "\033[31mYou should run \'yarn generate-graphql-files\' to update your *.graphql files !\033[0m" && exit 1; fi',
            capture=False, shell='/bin/bash')


# Usage:
#
# Generate all snapshots (delete all previous snapshots) :
# fab local.qa.snapshots
#
# Generate only snapshots, you are working on (@dev tag) :
# fab local.qa.snapshots:tags=dev
#
def snapshots(tags='false'):
    "Generate all snapshots"
    command('mysqldump --opt -h database -u root symfony > var/db.backup', 'application', Config.www_app)
    # You can run these commands individually.
    export_commands = [
        'capco:export:users --updateSnapshot --delimiter "," --env test',
        'capco:export:questionnaire --updateSnapshot --delimiter "," --env test',
        'capco:export:consultation --updateSnapshot --delimiter "," --env test',
        'capco:export:projects-contributors --updateSnapshot --delimiter "," --env test',
        'capco:export:step-contributors --updateSnapshot --delimiter "," --env test',
        'capco:export:proposalStep --updateSnapshot --delimiter "," --env test',
        'capco:export:events:participants --updateSnapshot --delimiter "," --env test',
        'capco:export:analysis --updateSnapshot --delimiter "," --env test',
        'capco:export:analysis --only-decisions --updateSnapshot --delimiter "," --env test'
    ]
    user_archives_commands = [
        'capco:export:user userAdmin --updateSnapshot --delimiter ","',
        'capco:export:user user1 --updateSnapshot --delimiter ","',
        'capco:export:user user5 --updateSnapshot --delimiter ","',
    ]
    extensions = [
        'csv',
        'xlsx',
        'xls',
    ]

    print(color_cyan + '/!\ Your database must be up to date, to generate accurate snapshots !' + color_white)

    if tags == 'false':
        print(color_cyan + 'Deleting email snapshots...' + color_white)
        os.system('rm -rf __snapshots__/emails/*')
    for suite in ['api', 'e2e', 'commands']:
        command(
            'UPDATE_SNAPSHOTS=true php -d memory_limit=-1 ./bin/behat -p ' + suite + ' ' + ('--tags=snapshot-email', '--tags=snapshot-email&&' + tags)[tags != 'false'],
            'application',
            Config.www_app)
    print(color_cyan + 'Successfully generated emails snapshots !' + color_white)

    if tags == 'false':
        print(color_cyan + 'Running user RGPD archive commands...' + color_white)
        for user_archives_command in user_archives_commands:
            command('bin/console ' + user_archives_command + ' --env test --no-debug', 'application', Config.www_app)
        print(color_cyan + 'Successfully generated user RGPD archive snapshots !' + color_white)

    command('bin/console capco:toggle:enable export --env test --no-debug', 'application', Config.www_app)

    if tags == 'false':
        print(color_cyan + 'Deleting exports snapshots...' + color_white)
        for extension in extensions:
            command('rm -rf __snapshots__/exports/*.' + extension, 'application', Config.www_app, 'root')

        print(color_cyan + 'Running export commands...' + color_white)
        for export_command in export_commands:
            command('bin/console ' + export_command + ' --quiet --no-debug', 'application', Config.www_app)

    print(color_cyan + 'Successfully generated snapshots !' + color_white)


def restore_db():
    command('mysql -h database -u root symfony < var/db.backup', 'application', Config.www_app, "capco", False)


def save_db():
    command('mysqldump --opt -h database -u root symfony > var/db.backup', 'application', Config.www_app, "capco", False)


def purge_rabbitmq():
    command('rabbitmqadmin purge queue name=elasticsearch_indexation --vhost="capco"', 'application', Config.www_app, "capco", False)


def save_es_snapshot():
    instance = Connection(Connection.host)
    instance.local('docker exec capco_application_1 curl -i -XPOST "http://elasticsearch:9200/_snapshot/repository_qa" -H "Content-Type: application/json" --data "{\\\"type\\\":\\\"fs\\\",\\\"settings\\\":{\\\"location\\\":\\\"var\\\"}}"')
    instance.local('docker exec capco_application_1 curl -i -XDELETE "http://elasticsearch:9200/_snapshot/repository_qa/snap_qa?pretty"')
    instance.local('docker exec capco_application_1 curl -XPUT "http://elasticsearch:9200/_snapshot/repository_qa/snap_qa?wait_for_completion=true" -H "Content-Type: application/json" --data "{\\\"indices\\\": \\\"capco\\\"}"')


def restore_es_snapshot():
    instance = Connection(Connection.host)
    instance.local('docker exec capco_application_1 curl -i -XPOST "http://elasticsearch:9200/capco/_close"')
    instance.local('docker exec capco_application_1 curl -i -XPOST "http://elasticsearch:9200/_snapshot/repository_qa/snap_qa/_restore?wait_for_completion=true" -H "Content-type: application/json" --data "{\\\"ignore_unavailable\\\":true,\\\"include_global_state\\\":false}"')
    instance.local('docker exec capco_application_1 curl -i -XPOST "http://elasticsearch:9200/capco/_open"')
    instance.local('docker exec capco_application_1 curl -i -XPOST "http://elasticsearch:9200/_aliases" -H "Content-Type: application/json" --data "{\\\"actions\\\":[{\\\"remove\\\":{\\\"index\\\":\\\"*\\\",\\\"alias\\\":\\\"capco_indexing\\\"}},{\\\"remove\\\":{\\\"index\\\":\\\"*\\\",\\\"alias\\\":\\\"capco\\\"}},{\\\"add\\\":{\\\"index\\\":\\\"capco\\\",\\\"alias\\\":\\\"capco_indexing\\\"}},{\\\"add\\\":{\\\"index\\\":\\\"capco\\\",\\\"alias\\\":\\\"capco\\\"}}]}"')


def behat(fast_failure='true', profile='false', suite='false', tags='false', timer='true'):
    "Run Gherkin Tests"
    command('mysqldump --opt -h database -u root symfony > var/db.backup', 'application', Config.www_app)
    if profile != 'false':
        profiles = [profile]
    else:
        profiles = ['api', 'commands', 'e2e']

    php_option = ''
    env_option = '--format=junit --out=./coverage --format=pretty --out=std'

    for job in profiles:
        commandToExecute = ('php ' + php_option + ' -d memory_limit=-1 ./bin/behat ' + env_option + ('', ' --log-step-times')[
            timer != 'false'] + ' -p ' + job + ('', '  --suite=' + suite)[suite != 'false'] + ('', '  --tags=' + tags)[
            tags != 'false'] + ('', '  --stop-on-failure')[fast_failure == 'true'])


def view(firefox='false'):
    if Config.dinghy:
        run('echo "secret" | open vnc://`docker-machine ip dinghy`')
    else:
        if firefox != 'false':
            run('echo "secret" | nohup vncviewer localhost:5901 &')
        else:
            run('echo "secret" | nohup vncviewer localhost:5900 &')


def clear_fixtures():
    run(
        'docker ps -a | awk \'{ print $1,$2 }\' | grep capco/fixtures | awk \'{print $1 }\' | xargs -I {} docker rm -f {}')


def kill_database_container():
    run('docker ps -a | grep databasefixtures | awk \'{print $1}\' | xargs -I {} docker kill {}', warn=True)


def blackfire_curl(url):
    "Blackfire curl"
    if Config.dinghy:
        run('eval "$(docker-machine env dinghy)" && docker exec -i capco_application_1 blackfire curl ' + url + '--insecure --env="Capco.Dev"')
    else:
        run('eval docker exec -u root -i capco_application_1 blackfire curl ' + url + '--insecure')


def blackfire_run(cli):
    "Blackfire run"
    if Config.dinghy:
        run('eval "$(docker-machine env dinghy)" && docker exec -u root -i capco_application_1 blackfire run ' + cli + ' --env="Cap Collectif / Capco.Dev"')
    else:
        run('eval docker exec -u root -i capco_application_1 blackfire run ' + cli)

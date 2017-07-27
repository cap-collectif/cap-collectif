from task import task
from fabric.operations import local, run, settings
from fabric.api import env
import re
import os


@task(environments=['ci'])
def load_cache():
    "Load cache"
    with settings(warn_only=True):
        for image, tags in get_images().iteritems():
            first_image = tags.pop(0)

            local('/bin/bash -c "if [[ -e ~/.docker-images/capco_%s.tar ]]; then docker load -i ~/.docker-images/capco_%s.tar; fi"' % (
                image,
                image
            ))

            for tag in tags:
                local('/bin/bash -c "if [[ -e ~/.docker-images/capco_%s.tar ]]; then docker tag capco_%s capco_%s; fi"' % (
                    image,
                    first_image,
                    tag
                ))


@task(environments=['local', 'ci'])
def save_fixtures_image(tag='latest'):
    "Publish a new fixtures image"
    env.service_command('php bin/console capco:reinit --force', 'application', env.www_app)
    env.service_command('mysqldump -h database -uroot --opt symfony > infrastructure/services/databasefixtures/dump.sql', 'application', env.www_app, 'root')
    env.compose('build databasefixtures')
    image_id = local('docker images | grep capco_databasefixtures | awk \'{print $3}\'', capture=True)
    local('docker tag -f ' + image_id + ' spyl94/capco-fixtures:' + tag)
    local('docker login --username=spyl94')
    local('docker push spyl94/capco-fixtures')


@task(environments=['ci'])
def save_cache():
    "Rebuild infrastructure and save cache"
        commit_message = local('git log --format=%B --no-merges -n 1', capture=True)

        if re.search('\[force-rebuild\]', commit_message) or change_detected():
            build()

        for image, tags in get_images().iteritems():
            local('docker save capco_%s > ~/.docker-images/capco_%s.tar' % (tags[0], image))

    #     local('docker pull elasticsearch:1.7.3')
    #     local('docker pull redis:3')
    #     local('docker pull selenium/hub:2.53.1-beryllium')
    #     local('docker pull selenium/node-chrome-debug:2.53.1-beryllium')
    #     local('docker pull jderusse/mailcatcher:latest')
    #     local('docker save capcotest_application > ~/.docker-images/capcotest_application.tar')
    #     local('docker save capcotest_applicationdata > ~/.docker-images/capcotest_applicationdata.tar')
    #     local('docker save capcotest_builder > ~/.docker-images/capcotest_builder.tar')
    #     local('docker save elasticsearch > ~/.docker-images/capcotest_elasticsearch.tar')
    #     local('docker save redis > ~/.docker-images/capcotest_redis.tar')
    #     local('docker save selenium/hub > ~/.docker-images/capcotest_seleniumhub.tar')
    #     local('docker save selenium/node-chrome-debug > ~/.docker-images/capcotest_chrome.tar')
    #     local('docker save jderusse/mailcatcher > ~/.docker-images/capcotest_mailcacher.tar')


def get_images():
    return {
        'application': ['application'],
        'applicationdata': ['applicationdata'],
        'builder': ['builder'],
        # 'elasticsearch': ['elasticsearch'],
        # 'redis': ['redis'],
        # 'database': ['database'],
        # 'selenium/hub': ['selenium/hub'],
        # 'selenium/node-chrome-debug': ['selenium/node-chrome-debug'],
        # 'jderusse/mailcatcher': ['jderusse/mailcatcher']
    }


def change_paths():
    return [
        'infrastructure/environments/base.yml',
        'infrastructure/services/(.+?)',
        '.circleci/.circle-cache',
    ]


def change_detected():
    compare_url = local('echo $CIRCLE_COMPARE_URL', capture=True)

    simpleMatch = re.search('https://github.com/cap-collectif/platform/commit/([a-z0-9]+?)$', compare_url)
    match = re.search('https://github.com/cap-collectif/platform/compare/([a-z0-9]+?)\.\.\.([a-z0-9]+?)$', compare_url)

    if simpleMatch is None and match is None:
        return

    if simpleMatch is not None:
        changes = local('git diff --name-only %s | cat' % simpleMatch.group(1), capture=True).split("\n")
    else:
        changes = local('git diff --name-only %s %s | cat' % (match.group(1), match.group(2)), capture=True).split("\n")

    change_in_infrastructure = False

    for change in changes:
        for regex in change_paths():
            change_in_infrastructure = change_in_infrastructure or re.search(regex, change) is not None

    return change_in_infrastructure

from task import task
from fabric.operations import local, run, settings
from fabric.api import env
from infrastructure import build
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


def get_images():
    return {
        'application': ['application'],
        'applicationdata': ['applicationdata'],
        'builder': ['builder'],
        'elasticsearch': ['elasticsearch'],
        'redis': ['redis'],
        'database': ['database'],
        'seleniumhub': ['seleniumhub'],
        'chrome': ['chrome'],
        'mailcatcher': ['mailcatcher']
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

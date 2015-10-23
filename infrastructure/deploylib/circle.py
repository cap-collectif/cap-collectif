from task import task
from fabric.operations import local, run, settings
from fabric.api import env
import re


@task(environments=['testing'])
def load_cache():
    "Load cache"
    local('/bin/bash -c "if [[ -e ~/docker/capcotest_application.tar ]]; then docker load -i ~/docker/capcotest_application.tar; fi"')
    local('/bin/bash -c "if [[ -e ~/docker/capcotest_builder.tar ]]; then docker load -i ~/docker/capcotest_builder.tar; fi"')


@task(environments=['testing'])
def save_cache():
    "Rebuild infrastructure and save cache"
    compare_url = local('echo $CIRCLE_COMPARE_URL', capture=True)

    simpleMatch = re.search('https://github.com/jolicode/CapCollectif-SF2/compare/([a-z0-9]+?)$', compare_url)
    match = re.search('https://github.com/jolicode/CapCollectif-SF2/compare/([a-z0-9]+?)\.\.\.([a-z0-9]+?)$', compare_url)

    if simpleMatch is None and match is None:
        return

    if simpleMatch is not None:
        changes = local('git diff --name-only %s | cat' % simpleMatch.group(1), capture=True).split("\n")
    else:
        changes = local('git diff --name-only %s %s | cat' % (match.group(1), match.group(2)), capture=True).split("\n")

    change_in_infrastructure = False

    for change in changes:
        match = re.search('^docker-compose.yml', change)

        if match is None:
            match = re.search('^infrastructure/services', change)

        if match is not None:
            change_in_infrastructure = True

    if change_in_infrastructure:
        env.compose('build')
        local('mkdir -p ~/docker')
        local('docker save capcotest_application > ~/docker/capcotest_application.tar')
        local('docker save capcotest_builder > ~/docker/capcotest_builder.tar')

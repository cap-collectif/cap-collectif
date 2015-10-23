from task import task
from fabric.operations import local, run, settings
from fabric.api import env

import app

@task
def build():
    "Build services for infrastructure"
    if env.boot2docker:
        local('docker-machine start capco')
    env.compose('build')


@task
def up():
    "Ensure infrastructure is sync and running"
    if env.boot2docker:
        local('docker-machine start capco')
    if env.build_at_up:
        env.compose('build')
    env.compose('up -d')


@task
def stop():
    "Stop the infrastructure"
    if env.boot2docker:
        local('docker-machine start capco')
    env.compose('stop')


@task
def clean():
    "Clean the infrastructure, will also remove all data"
    if env.boot2docker:
        local('docker-machine start capco')
    env.compose('rm -f -v')


@task
def ps():
    "Show infrastructure status"
    env.compose('ps')


@task
def logs():
    "Show infrastructure logs"
    env.compose('logs')

from task import task
from fabric.operations import local, run, settings
from fabric.api import env
import time
import app


@task
def build(use_cache='true'):
    "Build services for infrastructure"
    if env.boot2docker:
        ensure_dockermachine_up()
    env.compose('build' + ('', '  --no-cache')[use_cache == 'false'])


@task
def up(force_recreate='false'):
    "Ensure infrastructure is sync and running"
    if env.boot2docker:
        ensure_dockermachine_up()
    if env.build_at_up:
        env.compose('build')
    env.compose('up -d' + ('', ' --force-recreate')[force_recreate == 'true'])


@task
def stop():
    "Stop the infrastructure"
    env.compose('stop')
    if env.boot2docker:
        local('docker-machine stop capco')


@task
def reboot():
    stop()
    time.sleep(5)
    up()


@task
def clean():
    "Clean the infrastructure, will also remove all data"
    if env.boot2docker:
        ensure_dockermachine_up()
    env.compose('rm -f -v')


@task
def ps():
    "Show infrastructure status"
    env.compose('ps')


@task
def logs():
    "Show infrastructure logs"
    env.compose('logs')


def ensure_dockermachine_up():
    machine_running = local('docker-machine status capco', capture=True)
    if machine_running != 'Running':
        local('docker-machine start capco')

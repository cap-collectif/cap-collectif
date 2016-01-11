from task import task
from fabric.operations import local, run, settings
from fabric.api import env
import time
import app
from fabric.colors import red
from fabric.utils import abort


@task
def build(use_cache='true'):
    "Build services for infrastructure"
    ensure_vm_is_up()
    env.compose('build' + ('', '  --no-cache')[use_cache == 'false'])


@task
def up(force_recreate='false'):
    "Ensure infrastructure is sync and running"
    ensure_vm_is_up()
    if env.build_at_up:
        env.compose('build')
    env.compose('up -d' + ('', ' --force-recreate')[force_recreate == 'true'])


@task
def stop():
    "Stop the infrastructure"
    env.compose('stop')
    if env.dinghy:
        local('docker-machine stop dinghy')
    else:
        local('docker-machine stop capco')


@task
def reboot():
    stop()
    time.sleep(5)
    up()


@task
def clean():
    "Clean the infrastructure, will also remove all data"
    ensure_vm_is_up()
    env.compose('rm -f -v')


@task
def ps():
    "Show infrastructure status"
    env.compose('ps')


@task
def logs():
    "Show infrastructure logs"
    env.compose('logs')


def ensure_vm_is_up():
    if env.docker_machine:
        with settings(warn_only=True):
            machine_exist = local('docker-machine status capco')
        if not machine_exist.succeeded:
            print(red('[ERROR] Docker-machine capco doesn\'t exist, you should launch the \'make install\' command to install the VM and the project.'))
            abort('Make sure that docker-machine capco has already been created.')
        else:
            machine_running = local('docker-machine status capco', capture=True)
            if machine_running != 'Running':
                local('docker-machine start capco')
    if env.dinghy:
        machine_running = local('dinghy status', capture=True)
        if machine_running.splitlines()[0].strip() != 'VM: running':
            local('dinghy up --no-proxy')

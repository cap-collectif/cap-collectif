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
    env.compose('up --remove-orphans -d' + ('', ' --force-recreate')[force_recreate == 'true'])


@task
def stop():
    "Stop the infrastructure"
    env.compose('stop')


@task
def reboot():
    stop()
    time.sleep(5)
    up()


@task
def clean():
    "Clean the infrastructure, will also remove all data"
    ensure_vm_is_up()
    env.compose('down --remove-orphans -v')
    if env.dinghy:
        local('dinghy ssh docker run --rm -v /var/run/docker.sock:/var/run/docker.sock -v /etc:/etc spotify/docker-gc')


@task
def ps():
    "Show infrastructure status"
    env.compose('ps')


@task
def logs(containers=''):
    "Show infrastructure logs"
    env.compose('logs ' + containers)


def ensure_vm_is_up():
    if env.docker_machine:
        with settings(warn_only=True):
            machine_exist = local('docker-machine status capco')
        if not machine_exist.succeeded:
            print(red('[ERROR] Docker-machine capco doesn\'t exist, you should launch the \'fab local.system.docker_machine_install\' command to install the VM and the project.'))
            abort('Make sure that docker-machine capco has already been created.')
        else:
            machine_running = local('docker-machine status capco', capture=True)
            if machine_running != 'Running':
                local('docker-machine start capco')
    if env.dinghy:
        machine_exist = local('docker-machine status dinghy')
        if not machine_exist.succeeded:
            print(red('[ERROR] Dinghy machine doesn\'t exist, you should launch the \'fab local.system.dinghy_install\' command to install the VM and the project.'))
            abort('Make sure that dinghy machine has already been created.')

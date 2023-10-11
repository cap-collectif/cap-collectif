import time
from sys import platform as _platform
from fabric import Config, Connection
from infrastructure.deploylib.environments import compose
from invoke import run

color_cyan = '\033[96m'
color_white = '\033[0m'
color_red = '\033[91m'


def build(use_cache='true'):
    "Build services for infrastructure"
    ensure_vm_is_up()
    compose('build' + ('', '  --no-cache')[use_cache == 'false'])
    compose('pull')

def up(force_recreate='false', no_cache='false', mode='symfony_bin', build_at_up=False):
    """Ensure infrastructure is sync and running"""
    ensure_vm_is_up()
    if build_at_up:
        compose('build' + ('', '  --no-cache')[no_cache == 'true'])
    compose('up --remove-orphans -d' + ('', ' --force-recreate')[force_recreate == 'true'])
    if _platform == 'darwin' and mode == 'symfony_bin':
        run('symfony local:proxy:start')
        run('symfony local:server:start --daemon')
        print(color_cyan + 'Some browsers (e.g. Chrome) require to re-apply proxy settings (clicking on "Re-apply settings" button on the "chrome://net-internals/#proxy" page) or a full restart after starting the proxy. Otherwise, you ll see a "This webpage is not available" error (ERR_NAME_NOT_RESOLVED).' + color_white)


def stop(mode='symfony_bin'):
    """Stop the infrastructure"""
    if _platform == 'darwin' and mode == 'symfony_bin':
        run('symfony local:server:stop')
        run('symfony local:proxy:stop')
    compose('stop')


def reboot(mode='symfony_bin'):
    stop()
    time.sleep(5)
    up(mode=mode)


def clean():
    "Clean the infrastructure, will also remove all data"
    ensure_vm_is_up()
    compose('down --remove-orphans -v')


def ps():
    "Show infrastructure status"
    compose('ps')


def logs(containers=''):
    "Show infrastructure logs"
    compose('logs ' + containers)


def ensure_vm_is_up():
    if Config.docker_machine:
        machine_exist = run('docker-machine status capco', warn=True)
        if not machine_exist.succeeded:
            print(color_red + '[ERROR] Docker-machine capco doesn\'t exist, you should launch the \'fab local.system.docker_machine_install\' command to install the VM and the project.' + color_white)
            raise Exit('Make sure that docker-machine capco has already been created.')
        else:
            machine_running = run('docker-machine status capco')
            if machine_running.stdout != 'Running':
                run('docker-machine start capco')
    if Config.docker_for_mac:
        docker_running = run('docker ps', warn=True)
        if docker_running.stderr:
            print('[Info] Launching docker for mac !' + color_white)
            run('open /Applications/Docker.app')
            time.sleep(8)
            print('[Info] docker for mac should be up !' + color_white)

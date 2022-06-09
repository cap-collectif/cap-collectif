from functools import wraps
from sys import platform as _platform
from fabric import Config, Connection
from invoke import run

import yaml
import os

environments = {}


def environnment(config):
    @wraps(config)
    def inner():
        Config.environment = config.__name__
        return config()
    environments[config.__name__] = inner
    return inner


@environnment
def ci():
    Connection.host = 'docker@localhost'
    Config.compose_files = ['infrastructure/environments/base.yml', 'infrastructure/environments/testing.yml']
    Config.local = True
    Config.directory = Config.root_dir
    Config.ci = True


@environnment
def local():
    if _platform == "linux" or _platform == "linux2":
        locallinux()
    elif _platform == "darwin":
        print("Using docker for mac, please make sur you have at least 6GB of RAM on VM (for ES).")
        localmac_dockerformac()
    Connection.host = 'docker@localhost'
    Config.compose_files = ['infrastructure/environments/base.yml', 'infrastructure/environments/development.yml']
    Config.shell = "/bin/sh -c"
    Config.directory = Config.root_dir


def localmac_dockerformac():
    Config.local = True
    Config.docker_for_mac = True
    Config.local_ip = '127.0.0.1'
    Config.asset_host = 'capco.dev'


def locallinux():
    Config.local = True
    Config.local_ip = '127.0.0.1'


def ssh_into(service, user='capco'):
    if Config.docker_machine:
        os.system('eval "$(docker-machine env capco)" && docker exec -t -i -u %s %s_%s_1 /bin/bash' % (user, Config.project_name, service))
    elif Config.lxc:
        os.system("Disabled in lxc environment.")
    else:
        os.system('docker exec -t -i -u %s %s_%s_1 /bin/bash' % (user, Config.project_name, service))


def command(command_name, service, directory=".", user="capco", interactive=False):
    if Config.lxc:
        return run('sudo lxc-attach -n "$(docker inspect --format \'{{.Id}}\' %s_%s_1)" -- /bin/bash -c -l \'cd %s && su %s -c "%s"\'' % (Config.project_name, service, directory, user, command_name))
    elif Config.docker_machine:
        return run('eval "$(docker-machine env capco)" && docker exec -t %s %s_%s_1 /bin/bash -c -l \'cd %s && su %s -c "%s"\'' % (("", "-i")[interactive], Config.project_name, service, directory, user, command_name))
    else:
        return run('docker exec -t %s %s_%s_1 /bin/bash -c -l \'cd %s && su %s -c "%s"\'' % (("", "-i")[interactive], Config.project_name, service, directory, user, command_name))


def compose_run(command_name, service, directory=".", user="root", no_deps=False):
    if no_deps:
        compose('run --no-deps -u %s %s /bin/bash -c "cd %s && /bin/bash -c \\"%s\\""' % (user, service, directory, command_name))
    else:
        compose('run -u %s %s /bin/bash -c "cd %s && %s"' % (user, service, directory, command_name))


def compose(command_name):
    merge_infra_files()
    os.chdir(Config.directory)
    if Config.docker_machine:
        run('eval "$(docker-machine env capco)" && docker-compose -p %s -f %s/%s %s' % (Config.project_name, Config.directory, Config.temporary_file, command_name))
    else:
        run('docker-compose -p %s -f %s/%s %s' % (Config.project_name, Config.directory, Config.temporary_file, command_name))


def pull(revision, directory, remote='origin'):
    with os.chdir(directory):
        instance = Connection(Connection.host)
        instance.local('git remote update')
        instance.local('git checkout %s/%s' % (remote, revision))
        instance.local('git rev-parse --short HEAD > VERSION')


def merge_infra_files():
    output = None

    for file in Config.compose_files:
        stream = open(Config.root_dir + '/' + file, 'r')

        if output is None:
            output = yaml.safe_load(stream)
        else:
            output = merge(yaml.safe_load(stream), output)

        stream.close()

    outputStream = open(Config.root_dir + '/' + Config.temporary_file, 'w')
    yaml.safe_dump(output, outputStream)
    outputStream.close()

    if not Config.local:
        c = Connection(Connection.host)
        c.put(Config.root_dir + '/' + Config.temporary_file, Config.directory + '/' + Config.temporary_file)


def merge(user, default):
    if isinstance(user, dict) and isinstance(default, dict):
        for k, v in default.items():
            if k not in user:
                user[k] = v
            else:
                user[k] = merge(user[k], v)
    return user


Config.directory = '/home/capco'
Config.docker = True
Config.ci = False
Config.project_name = 'capco'
Config.www_app = '/var/www/'
Config.local = False
Config.docker_machine = False
Config.docker_for_mac = False
Config.assets_host = ''
Config.build_at_up = True
Config.lxc = False
Config.root_dir = os.path.realpath(os.path.dirname(os.path.realpath(__file__)) + '/../..')
Config.compose_files = []
Config.temporary_file = 'infrastructure/environments/current.yml'

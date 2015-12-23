from fabric.api import env, cd
from functools import wraps
from fabric.operations import local as lrun, run
from sys import platform as _platform
from yaml import load, dump

import os

environments = {}


def environnment(config):
    @wraps(config)
    def inner():
        env.environment = config.__name__
        return config()
    environments[config.__name__] = inner
    return inner


@environnment
def testing():
    env.host_string = 'docker@circleci'
    env.compose_files = ['infrastructure/environments/base.yml', 'infrastructure/environments/testing.yml']
    env.run = lrun
    env.local = True
    env.project_name = 'capcotest'
    env.build_at_up = False
    env.lxc = True
    env.directory = env.root_dir

@environnment
def local():
    if _platform == "linux" or _platform == "linux2":
        locallinux()
    elif _platform == "darwin":
        localmac()
    env.host_string = 'docker@localhost'
    env.compose_files = ['infrastructure/environments/base.yml', 'infrastructure/environments/development.yml']
    env.shell = "/bin/sh -c"
    env.directory = env.root_dir

def localmac():
    env.run = lrun
    env.local = True
    env.host_string = 'docker@boot2docker'
    env.key_filename = '~/.ssh/id_boot2docker'
    env.boot2docker = True
    env.local_ip = '192.168.99.100' # to verify


def locallinux():
    env.run = lrun
    env.local = True
    env.local_ip = '127.0.0.1'


def ssh_into(service):
    if env.boot2docker:
        env.run('eval "$(docker-machine env capco)" && docker exec -t -i -u capco %s_%s_1 /bin/bash' % (env.project_name, service))
    else:
        env.run('docker exec -t -i -u capco %s_%s_1 /bin/bash' % (env.project_name, service))

def command(command_name, service, directory=".", user="capco"):
    if env.lxc:
        env.run('sudo lxc-attach -n "$(docker inspect --format \'{{.Id}}\' %s_%s_1)" -- /bin/bash -c -l \'cd %s && su %s -c "%s"\'' % (env.project_name, service, directory, user, command_name))
    elif env.boot2docker:
        env.run('eval "$(docker-machine env capco)" && docker exec -t -i %s_%s_1 /bin/bash -c -l \'cd %s && su %s -c "%s"\'' % (env.project_name, service, directory, user, command_name))
    else:
        env.run('docker exec -t -i %s_%s_1 /bin/bash -c -l \'cd %s && su %s -c "%s"\'' % (env.project_name, service, directory, user, command_name))

def compose_run(command_name, service, directory=".", user="root", no_deps=False):
    if no_deps:
        env.compose('run --no-deps -u %s %s /bin/bash -c "cd %s && /bin/bash -c \\"%s\\""' % (user, service, directory, command_name))
    else:
        env.compose('run -u %s %s /bin/bash -c "cd %s && %s"' % (user, service, directory, command_name))

def compose(command_name):
    merge_infra_files()
    with cd(env.directory):
        if env.boot2docker:
            env.run('eval "$(docker-machine env capco)" && docker-compose -p %s -f %s/%s %s' % (env.project_name, env.directory, env.temporary_file, command_name))
        else:
            env.run('docker-compose -p %s -f %s/%s %s' % (env.project_name, env.directory, env.temporary_file, command_name))

def pull(revision, directory, remote='origin'):
    with cd(directory):
        env.run('git remote update')
        env.run('git checkout %s/%s' % (remote, revision))
        env.run('git rev-parse --short HEAD > VERSION')

def merge_infra_files():
    output = None

    for file in env.compose_files:
        stream = open(env.root_dir + '/' + file, 'r')

        if output is None:
            output = load(stream)
        else:
            output = merge(load(stream), output)

        stream.close()

    outputStream = open(env.root_dir + '/' + env.temporary_file, 'w')
    dump(output, outputStream)
    outputStream.close()

    if not env.local:
        put(env.root_dir + '/' + env.temporary_file, env.directory + '/' + env.temporary_file)


def merge(user, default):
    if isinstance(user, dict) and isinstance(default, dict):
        for k, v in default.iteritems():
            if k not in user:
                user[k] = v
            else:
                user[k] = merge(user[k], v)
    return user

env.directory = '/home/capco'
env.docker = True
env.service_command = command
env.compose = compose
env.compose_run = compose_run
env.project_name = 'capco'
env.www_app = '/var/www/'
env.ssh_into = ssh_into
env.pull = pull
env.local = False
env.boot2docker = False
env.build_at_up = True
env.lxc = False
env.root_dir = os.path.realpath(os.path.dirname(os.path.realpath(__file__)) + '/../..')
env.compose_files = []
env.temporary_file = 'infrastructure/environments/current.yml'

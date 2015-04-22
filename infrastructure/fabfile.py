 #!/usr/bin/env python
 # -*- coding: utf-8 -*-

from __future__ import with_statement
from fabric.api import *
from fabric.context_managers import lcd
import csv
import sys
import io

env.warn_only = True

env.client_dir = '/home/capco/data'
env.infrastructure_dir = '/home/capco/CapCollectif-SF2/infrastructure'
env.nginx_conf_file = env.client_dir + '/vhosts.conf' # TODO
env.docker_composer_conf_file = env.client_dir + '/docker-compose.yml' # TODO
env.base_vhost = 'cap-collectif.com'
env.docker_vhost_port = 80
env.docker_bin = 'sudo docker'

candidats = []

# def vagrant():
#     env.client_dir = '/home/vagrant/candidats'
#     env.nginx_conf_file = '/home/vagrant/candidats/vhosts.conf' # TODO
#     env.base_vhost = 'vagrant.candidat.dev'
#     env.docker_vhost_port = 49000
#     env.docker_bin = 'docker'

def boot2docker():
    env.docker_bin = 'export DOCKER_HOST=tcp://$(boot2docker ip 2>/dev/null):2375 && docker'


def localhost():
    env.client_dir = '/Users/bast/Sites/drupal/opengov/CapCollectif-SF2/infrastructure/data'
    local('mkdir -p %s' % env.client_dir)
    env.nginx_conf_file = env.client_dir + '/vhosts.conf' # TODO
    env.docker_composer_conf_file = env.client_dir + '/docker-compose.yml' # TODO
    env.base_vhost = 'boot2docker.capco.dev'


def generate(upgrade = False):
    parse_csv()
    generate_docker_compose()
    launch_docker(upgrade)
    generate_vhosts()


def build_and_generate():
    build()
    generate(True)


def build():
    # local('rm -f services/web/VERSION && echo time > services/web/VERSION')
    local('docker-compose build demo')


def docker_build_vm_base():
    # local('docker-compose build builder')
    # local('cd .. && git pull --rebase origin develop')
    # local('docker-compose up builder')
    # local('rm -rf app/cache/* app/logs/*')
    local('rm -f services/web/VERSION && echo time > services/web/VERSION')
    local('docker-compose build demo')


def launch_docker(upgrade = False):
    for c in candidats:
        container_id = Docker().get_container_id(c)

        if (container_id):

            # we do not proceed if container exists
            # and not in upgrade mode
            if (not upgrade):
                continue

            # need to check that not on current version
            is_late = local("sudo docker ps | grep %s | grep '%s->80'| grep 'latest" % (c.user, c.port), True)
            print 'stopping' + container_id + " " + is_late

            # and stop it
            Docker().stop(c)

        # launching
        print "launching"
        Docker().start(c)


def generate_docker_compose():
    config = io.open(env.docker_composer_conf_file, 'w')

    # generate base config
    for line in io.open('templates/docker-compose_base.conf', 'r'):
        config.write(line)

    # generate site config
    for c in candidats:
        for line in io.open('templates/docker-compose_site.conf', 'r'):
            line = line.replace('%%PORT%%', c.port)
            line = line.replace('%%SHORTNAME%%', c.user)
            line = line.replace('%%PATH_TO_INFRA%%', env.infrastructure_dir)
            config.write(line)

    # Close the files
    config.close()


def generate_vhosts():
    config = io.open(env.nginx_conf_file, 'w')
    for c in candidats:
        if c.is_redirect and c.domains != '':
            for line in io.open('templates/vhost_redirect.conf', 'r'):
                line = line.replace('%%FROM%%', c.user + '.' + env.base_vhost)
                line = line.replace('%%TO%%', c.domains.split(' ')[0])
                config.write(line)

        # Read the lines from the template, substitute the values, and write to the new config file
        for line in io.open('templates/vhost.conf', 'r'):
            if c.is_redirect and c.domains != '':
                line = line.replace('%%DOMAINS%%', c.domains)
            else:
                line = line.replace('%%DOMAINS%%', c.domains + ' ' + c.user + '.' + env.base_vhost)
            line = line.replace('%%PORT%%', c.port)
            config.write(line)

    # Close the files
    config.close()

    # local('sudo nginx -s reload')


def parse_csv():
    """
    Files are composed of:
    <code name>:<docker port number>:<domain names>

    Parse it and fill the list of Candidats
    """
    with open('sites.csv') as lines:
        spamreader = csv.reader(lines, delimiter=';', quotechar='|')
        for row in spamreader:
            c = Candidat(row[0], row[1], row[2])
            c.display()
            c.init_dir()
            candidats.append(c)

            print "================"


def docker_clean():
    """
    Clean all docker containers and images
    """
    local('docker rm `docker ps -a -q`')
    local('docker images | grep "^<none>" | awk \'{print "docker rmi "$3}\' | sh')


class Candidat:


    def __init__(self, user, port, domains):
        self.user = user
        self.port = port
        self.domains = domains
        self.is_redirect = False
        self.dirs = {
            'home_dir': '%s/%s' % (env.client_dir, user),
            'site_dir': '%s/%s/config' % (env.client_dir, user),
            'files_dir': '%s/%s/files' % (env.client_dir, user),
            'mysql_dir': '%s/%s/mysql' % (env.client_dir, user),
        }


    def set_is_redirect(self, is_redirect):
        if (is_redirect == 'redirect'):
            self.is_redirect = True


    def init_dir(self):
        for path in self.dirs:
            local('mkdir -p %s' % (self.dirs[path]))


    def display(self):
        print "user " + self.user
        print "port " + self.port
        print "domains " + self.domains


class Docker:

    def start(self, c):
        with lcd('%s' % env.client_dir):
            local('docker-compose up -d capco%s' % c.user)
        # local('sudo docker run -d -t -p %s:80 --name="%s" -v="%s":"/var/www/app/config/override" -v="%s":"/var/lib/mysql" %s' % (c.port, c.user, c.dirs['site_dir'], c.dirs['mysql_dir'], env.docker_name)) # launch


    def stop(self, c):
        with lcd('%s' % env.client_dir):
            local('docker-compose stop capco%s' % c.user)
            local('docker-compose rm capco%s' % c.user)
        # local('sudo docker stop -t=15 %s' % (container_id))
        # local('sudo docker rm %s' % (container_id))


    def get_container_id(self, c):
        print c.port
        # container = local("sudo docker ps | grep %s | grep '%s->80'| awk '{print $1}'" % (env.docker_name, c.port), True)
        container = local("docker ps | grep '%s->80'| awk '{print $1}'" % (c.port), True)
        return container


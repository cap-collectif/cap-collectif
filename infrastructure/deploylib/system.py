from task import task
from fabric.operations import local, run, settings
from fabric.api import env
from fabric.colors import cyan
from infrastructure import ensure_vm_is_up
import os


@task(environments=['local'])
def linux_docker_install(force=False):
    """
    Install docker on linux
    """
    if env.docker_machine or env.dinghy:
        return

    local('curl -sSL https://get.docker.com/ | sh')
    local('curl -L https://github.com/docker/compose/releases/download/1.5.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose')
    local('sudo apt-get install unrar')

def dinghy_deps():
    local('brew install docker docker-machine')
    local('brew install docker-machine-nfs xhyve docker-machine-driver-xhyve')
    local('brew tap codekitchen/dinghy')
    local('brew install dinghy')
    local('sudo chown root:wheel $(brew --prefix)/opt/docker-machine-driver-xhyve/bin/docker-machine-driver-xhyve')
    local('sudo chmod u+s $(brew --prefix)/opt/docker-machine-driver-xhyve/bin/docker-machine-driver-xhyve')


@task(environments=['local'])
def dinghy_install(force=False):
    """
    Install dinghy
    """
    with settings(warn_only=True):
        result = local('which dinghy')
        if force or not result.succeeded:
            dinghy_deps()
    with settings(warn_only=True):
        local('dinghy create --provider=xhyve --memory=4096 --cpus=8 --boot2docker-url=https://github.com/boot2docker/boot2docker/releases/download/v18.06.1-ce/boot2docker.iso')


@task(environments=['local'])
def docker_macos_mountnfs():
    """
    Mount nfs shared folder on docker-machine
    """
    if not env.docker_machine:
        return

    with settings(warn_only=True):
        local('VBoxManage sharedfolder remove capco --name Users')

    ensure_vm_is_up()
    with settings(warn_only=True):
        env.host_string = 'docker@%s' % local('docker-machine ip capco', capture=True)
    env.key_filename = '~/.docker/machine/machines/capco/id_rsa'
    env.shell = "/bin/sh -c"
    env.local_dir = env.real_fabfile[:-10]

    with settings(warn_only=True):
        run('sudo umount %s' % env.local_dir)
        run('sudo /usr/local/etc/init.d/nfs-client start')
        run('sudo mkdir -p %s && sudo mount -t nfs -o rw 192.168.99.1:%s %s' % (env.local_dir, env.local_dir, env.local_dir))


@task(environments=['local'])
def configure_vhosts():
    """
    Update /etc/hosts file with domains
    """

    domains = [
        'capco.dev',
        'capco.prod',
        'capco.test',
        # To test paris login
        'capco.paris.fr',
    ]

    for domain in domains:
        with settings(warn_only=True):
            if not local('cat /etc/hosts | grep %s | grep %s' % (domain, env.local_ip), capture=True):
                print cyan('%s should point to %s in /etc/hosts' % (domain, env.local_ip))
                local('echo "%s %s" | sudo tee -a /etc/hosts' % (env.local_ip, domain))


@task
def generate_ssl():
    """
    Generate CRT (Black Magic)
    """
    env.ssl_dir = env.real_fabfile[:-10] + "infrastructure/services/local/nginx/ssl/"
    env.root.crt = env.ssl_dir + "rootCA.crt"
    env.root.key = env.ssl_dir + "rootCA.key"
    env.csr = env.ssl_dir + "capco.csr"
    env.pem = env.ssl_dir + "capco.pem"
    env.csr.conf = env.ssl_dir + "capco.csr.cnf"
    env.csr.v3 = env.ssl_dir + "v3.ext"
    env.key = env.ssl_dir + "capco.key"
    env.crt = env.ssl_dir + "capco.crt"
    env.pfx = env.ssl_dir + "capco.pfx"

    local('openssl req -new -sha256 -nodes -out %s -newkey rsa:2048 -keyout %s -config <( cat %s )' % (env.csr, env.key, env.csr.conf))
    local('openssl x509 -req -in %s -CA %s -CAkey %s -CAcreateserial -out %s -days 3000 -sha256 -extfile %s' % (env.csr, env.root.crt, env.root.key, env.crt, env.csr.v3))
    local('cat %s %s > %s' % (env.crt, env.key, env.pem))
    local('openssl pkcs12 -export -inkey %s  -in %s -name "capco.dev" -out %s' % (env.key, env.pem, env.pfx))


@task
def sign_ssl():
    local('sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain %s' % env.real_fabfile[:-10] + "infrastructure/services/local/nginx/ssl/capco.cer")

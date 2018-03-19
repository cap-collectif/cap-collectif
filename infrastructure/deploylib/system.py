from task import task
from fabric.operations import local, run, settings
from fabric.api import env
from fabric.colors import cyan
from infrastructure import ensure_vm_is_up


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


@task(environments=['local'])
def docker_machine_install(force=False):
    """
    Install docker-machine
    """
    if not env.docker_machine:
        return

    with settings(warn_only=True):
        result = local('which docker-machine')
        if force or not result.succeeded:
            docker_toolbox_install()

    with settings(warn_only=True):
        local('docker-machine create --driver virtualbox --virtualbox-memory 4096 --virtualbox-disk-size 30000 --virtualbox-cpu-count 8 --virtualbox-hostonly-nictype "Am79C973" capco')


def docker_toolbox_install():
    local('brew install caskroom/cask/brew-cask')
    local('brew cask install dockertoolbox')


@task(environments=['local'])
def dinghy_install(force=False):
    """
    Install dinghy
    """
    with settings(warn_only=True):
        result = local('which dinghy')
        if force or not result.succeeded:
            docker_toolbox_install()
            local('brew tap codekitchen/dinghy')
            local('brew install dinghy')

    with settings(warn_only=True):
        local('dinghy create --provider=virtualbox --memory=4096 --disk=30000 --cpus=8')


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
    ]

    for domain in domains:
        with settings(warn_only=True):
            if not local('cat /etc/hosts | grep %s | grep %s' % (domain, env.local_ip), capture=True):
                print cyan('%s should point to %s in /etc/hosts' % (domain, env.local_ip))
                local('echo "%s %s" | sudo tee -a /etc/hosts' % (env.local_ip, domain))


@task
def generate_ssl():
    """
    Generate CRT
    """
    env.ssl_dir = env.real_fabfile[:-10] + "infrastructure/services/local/nginx/ssl/"
    env.csr = env.ssl_dir + "capco.csr"
    env.key = env.ssl_dir + "capco.key"
    env.crt = env.ssl_dir + "capco.crt"
    env.conf = env.ssl_dir + "openssl.conf"

    local('openssl genrsa -out %s 2048' % env.key)
    local('openssl req -new -key %s -out %s -subj "/C=/ST=/O=/localityName=/commonName=*.%s/organizationalUnitName=/emailAddress=/" -config %s -passin pass:' % (env.key, env.csr, "capco.dev", env.conf))
    local('openssl x509 -req -days 365 -in %s -signkey %s -out %s -extensions v3_req -extfile %s' % (env.csr, env.key, env.crt, env.conf))


@task
def sign_ssl():
    local('sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain %s' % env.real_fabfile[:-10] + "infrastructure/services/local/nginx/ssl/ca.pem")

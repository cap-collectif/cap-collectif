from task import task
from fabric.operations import local, run, settings
from fabric.api import env
from fabric.colors import cyan


@task(environments=['local'])
def ubuntu_docker_install(force=False):
    """
    Install docker on ubuntu
    """
    if env.boot2docker:
        return

    local('curl -sSL https://get.docker.com/ | sh')
    local('curl -L https://github.com/docker/compose/releases/download/1.4.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose')


@task(environments=['local'])
def macos_install(force=False):
    """
    Install boot2docker
    """
    if not env.boot2docker:
        return

    with settings(warn_only=True):
        # boot2docker
        result = local('which docker-machine')
        if force or not result.succeeded:
            local('brew install caskroom/cask/brew-cask')
            local('brew cask install dockertoolbox')

    with settings(warn_only=True):
        local('docker-machine create --driver virtualbox --virtualbox-memory 4096 --virtualbox-disk-size 15000 capco')
    local('docker-machine start capco')


@task(environments=['local'])
def macos_mountnfs():
    """
    Mount nfs shared folder on boot2docker
    """
    if not env.boot2docker:
        return

    with settings(warn_only=True):
        local('VBoxManage sharedfolder remove capco-vm --name Users')

    local('boot2docker --vbox-share=disable up')
    with settings(warn_only=True):
        env.host_string = 'docker@%s' % local('docker-machine ip capco', capture=True)
    env.key_filename = '~/.docker/machine/machines/capco/id_rsa'
    env.shell = "/bin/sh -c"

    env.local_dir = env.real_fabfile[:-10]
    print env.local_dir

    with settings(warn_only=True):
        run('sudo umount %s' % env.local_dir)
        run('sudo /usr/local/etc/init.d/nfs-client start')
        # run('sudo mkdir -p /Users && sudo mount -t nfs -o noatime,soft,nolock,vers=3,udp,proto=udp,rsize=8192,wsize=8192,namlen=255,timeo=10,retrans=3,nfsvers=3 -v 192.168.59.3:/Users /Users')
        run('sudo mkdir -p %s && sudo mount -t nfs -o rw 192.168.99.1:%s %s' % (env.local_dir, env.local_dir, env.local_dir ))


@task(environments=['local'])
def configure_vhosts():
    """
    Update /etc/hosts file with domains
    """

    domains = [
        'capco.dev',
    ]

    for domain in domains:
        with settings(warn_only=True):
            if not local('cat /etc/hosts | grep %s | grep %s' % (domain, env.local_ip), capture=True):
                print cyan('%s should point to %s in /etc/hosts' % (domain, env.local_ip))
                local('echo "%s %s" | sudo tee -a /etc/hosts' % (env.local_ip, domain))

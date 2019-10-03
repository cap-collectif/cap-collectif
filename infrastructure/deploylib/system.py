from task import task
from fabric.operations import local, run, settings
from fabric.api import env
from sys import platform as _platform
from fabric.colors import cyan, yellow
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

def symfony_bin_deps():
    symfony_bin_dir = '~/.symfony/bin'
    local('brew list | grep php | while read x; do echo $x; done')
    local('rm -rf /usr/local/Cellar/php')
    local('rm ~/Library/LaunchAgents/homebrew.mxcl.php*')
    local('sudo rm /Library/LaunchDaemons/homebrew.mxcl.php*')
    local('brew cleanup')
    local('brew update')
    local('brew doctor')
    local('brew install pkg-config')
    local('brew install php')
    local('brew install composer')
    local('curl -sS https://get.symfony.com/cli/installer | bash')
    local('mv ' + symfony_bin_dir + '/symfony /usr/local/bin/symfony')
    local('brew install imagemagick')
    local('printf "\n" | pecl install imagick')
    local('printf "\n" | pecl install redis')

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
        local('dinghy create --provider=xhyve --memory=4096 --cpus=8 --disk=60000 --boot2docker-url=https://github.com/boot2docker/boot2docker/releases/download/v18.06.1-ce/boot2docker.iso')

@task
def symfony_bin_install(force=False):
    """
    Install PHP, Composer and Symfony binary in local machine
    """
    with settings(warn_only=True):
        result = local('php -v > /dev/null && symfony > /dev/null && composer > /dev/null')
        if force or not result.succeeded:
            symfony_bin_deps()
        else:
            print yellow('You already have the required dependencies (PHP, Symfony binary and Composer)')


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
    key_filename = '~/.docker/machine/machines/capco/id_rsa'
    env.shell = "/bin/sh -c"
    env.local_dir = env.real_fabfile[:-10]

    with settings(warn_only=True):
        run('sudo umount %s' % env.local_dir)
        run('sudo /usr/local/etc/init.d/nfs-client start')
        run('sudo mkdir -p %s && sudo mount -t nfs -o rw 192.168.99.1:%s %s' % (env.local_dir, env.local_dir, env.local_dir))


@task(environments=['local'])
def configure_vhosts(mode="symfony_bin"):
    """
    Update /etc/hosts file with domains
    """

    domains = [
        'capco.dev',
        'capco.prod',
        'capco.test',
        # To test paris login
        'capco.paris.fr',
        'wwww.capco.nantes.fr',
        'www.sous.sous.domaine.lille.fr',
        # Exposed services
        'mail.cap.co',
        'mail.capco.paris.fr',
        'wwww.mail.capco.nantes.fr',
        'www.mail.sous.sous.domaine.lille.fr',
        'kibana.cap.co',
        'rabbitmq.cap.co',
        'cerebro.cap.co',
    ]
    with settings(warn_only=True):
        if _platform == 'darwin' and mode == "symfony_bin":
            domains.remove('capco.dev')
            tld = 'dev'
            proxy_path = '~/.symfony/proxy.json'
            local('symfony local:proxy:domain:attach capco')
            if local('cat ' + proxy_path + ' | grep \'%s\'' % '"tld": "wip"', capture=True):
                local("sed -i .bak 's/\"tld\": \"wip\"/\"tld\": \"" + tld + "\"/g' " + proxy_path)
            print cyan('Successfully attached Symfony proxy domain to ') + yellow('capco.' + tld)

        for domain in domains:
            if not local('cat /etc/hosts | grep %s | grep %s' % (domain, env.local_ip), capture=True):
                print cyan('%s should point to %s in /etc/hosts' % (domain, env.local_ip))
                local('echo "%s %s" | sudo tee -a /etc/hosts' % (env.local_ip, domain))


@task
def generate_ssl():
    """
    Generate CRT (Black Magic)
    """
    ssl_dir = env.real_fabfile[:-10] + "infrastructure/services/local/nginx/ssl/"
    rootcrt = ssl_dir + "rootCA.crt"
    rootkey = ssl_dir + "rootCA.key"
    csr = ssl_dir + "capco.csr"
    pem = ssl_dir + "capco.pem"
    csrconf = ssl_dir + "capco.csr.cnf"
    csrv3 = ssl_dir + "v3.ext"
    key = ssl_dir + "capco.key"
    crt = ssl_dir + "capco.crt"
    pfx = ssl_dir + "capco.pfx"

    local('openssl req -new -sha256 -nodes -out %s -newkey rsa:2048 -keyout %s -config %s' % (csr, key, csrconf))
    local('openssl x509 -req -in %s -CA %s -CAkey %s -CAcreateserial -out %s -days 3000 -sha256 -extfile %s' % (csr, rootcrt, rootkey, crt, csrv3))
    local('cat %s %s > %s' % (crt, key, pem))
    local('openssl pkcs12 -export -inkey %s  -in %s -name "capco.dev" -out %s' % (key, pem, pfx))

def sign_ssl_linux():
    local('sudo cp infrastructure/services/local/nginx/ssl/rootCA.crt /etc/ssl/certs/')
    local('sudo cp infrastructure/services/local/nginx/ssl/rootCA.key /etc/ssl/private')
    local('sudo apt install libnss3-tools -y')
    local('curl https://github.com/FiloSottile/mkcert/releases/download/v1.4.0/mkcert-v1.4.0-linux-amd64 --output mkcert')
    local('chmod +x ./mkcert')
    local('mv ./mkcert /usr/local/bin')
    local('mkcert -install')

def sign_ssl_mac():
    local('brew install mkcert')
    local('brew install nss')
    local('mkcert -install')
    local('symfony local:server:ca:install')

@task
def sign_ssl():
    if _platform == "linux" or _platform == "linux2":
        sign_ssl_linux()
    elif _platform == "darwin":
        local('sudo security add-trusted-cert -d -r trustAsRoot -k /Library/Keychains/System.keychain %s' % env.real_fabfile[:-10] + "infrastructure/services/local/nginx/ssl/capco.cer")
        sign_ssl_mac()
    services = [
        'mail.cap.co',
        'cerebro.cap.co',
        'kibana.cap.co',
        'rabbitmq.cap.co',
    ]
    destination = 'infrastructure/services/local/nginx/ssl/'
    crt = 'capco_services.crt'
    key = 'capco_services.key'
    local('mkcert -cert-file=%s -key-file=%s %s' % (crt, key, ' '.join(services)))
    local('mv %s %s' % (crt, destination))
    local('mv %s %s' % (key, destination))
    print cyan('Successfully added HTTPS support !')

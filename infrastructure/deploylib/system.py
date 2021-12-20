from sys import platform as _platform
from fabric import Connection, Config
from invoke import run
import os


color_cyan = '\033[96m'
color_white = '\033[0m'
color_yellow = '\033[93m'


def linux_docker_install(force=False):
    """
    Install docker on linux
    """
    if Config.docker_machine or Config.dinghy:
        return

    run('curl -sSL https://get.docker.com/ | sh')
    run('curl -L https://github.com/docker/compose/releases/download/1.5.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose')
    run('sudo apt-get install unrar')


def dinghy_deps():
    run('brew install docker docker-machine')
    run('brew install docker-machine-nfs xhyve docker-machine-driver-xhyve')
    run('brew tap codekitchen/dinghy')
    run('brew install dinghy')
    run('sudo chown root:wheel $(brew --prefix)/opt/docker-machine-driver-xhyve/bin/docker-machine-driver-xhyve')
    run('sudo chmod u+s $(brew --prefix)/opt/docker-machine-driver-xhyve/bin/docker-machine-driver-xhyve')


def symfony_bin_deps():
    symfony_bin_dir = '~/.symfony/bin'
    run('brew list | grep php | while read x; do echo $x; done')
    run('rm -rf /usr/local/Cellar/php')
    run('rm ~/Library/LaunchAgents/homebrew.mxcl.php*')
    run('sudo rm /Library/LaunchDaemons/homebrew.mxcl.php*')
    run('brew cleanup')
    run('brew doctor')
    run('brew install pkg-config')
    run('brew install php@7.4')
    run('brew install composer')
    run('brew install fontconfig')
    run('brew install rabbitmq')
    run('brew install rabbitmq-c')
    run('brew install ag')
    run('curl -sS https://get.symfony.com/cli/installer | bash')
    run('mv ' + symfony_bin_dir + '/symfony /usr/local/bin/symfony')
    run('brew install imagemagick')
    run('printf "\n" | pecl install imagick')
    run('printf "\n" | pecl install redis')
    run('printf "\n" | pecl install pcov')
    run('echo $(brew --prefix rabbitmq-c) | pecl install amqp')


def dinghy_install(force=False):
    """
    Install dinghy
    """
    result = run('which dinghy', warn=True)
    if force or not result.ok:
        dinghy_deps()
    run('dinghy create --provider=xhyve --memory=4096 --cpus=8 --disk=60000')
    # In case of error, consider using virtualbox but perf is lower
    # run('dinghy create --provider=virtualbox --memory=4096 --cpus=8 --disk=60000')


def symfony_bin_install(force=False):
    """
    Install PHP, Composer and Symfony binary in local machine
    """
    result = run('php -v > /dev/null && symfony > /dev/null && composer > /dev/null', warn=True)
    if force or not result.ok:
        symfony_bin_deps()
    else:
        print(color_yellow + 'You already have the required dependencies (PHP, Symfony binary and Composer)' + color_white)


def configure_vhosts(mode='symfony_bin'):
    """
    Update /etc/hosts file with domains
    """

    domains = [
        'capco.dev',
        'capco.prod',
        'capco.test',
        # To test paris login
        'capco.paris.fr',
        # Exposed services
        'assets.cap.co',
        'mail.cap.co',
        'kibana.cap.co',
        'rabbitmq.cap.co',
        'cerebro.cap.co',
    ]
    localhost_domains = [
        'admin-next.capco.dev'
    ]
    if _platform == 'darwin' and mode == "symfony_bin":
        domains.remove('capco.dev')
        tld = 'dev'
        proxy_path = '~/.symfony/proxy.json'
        run('symfony local:proxy:domain:attach capco', warn=True)

        if run('cat ' + proxy_path + ' | grep \'%s\'' % '"tld": "wip"', warn=True).stdout:
            run("sed -i .bak 's/\"tld\": \"wip\"/\"tld\": \"" + tld + "\"/g' " + proxy_path, warn=True)
        print(color_cyan + 'Successfully attached Symfony proxy domain to ' + color_yellow + 'capco.' + tld + color_white)

    for domain in domains:
        if not run('cat /etc/hosts | grep %s | grep %s' % (domain, Config.local_ip), warn=True).stdout:
            print(color_cyan + '%s should point to %s in /etc/hosts' % (domain, Config.local_ip) + color_white)
            run('echo "%s %s" | sudo tee -a /etc/hosts' % (Config.local_ip, domain), warn=True)

    for domain in localhost_domains:
        if not run('cat /etc/hosts | grep %s | grep %s' % (domain, '127.0.0.1'), warn=True).stdout:
            print(color_cyan + '%s should point to %s in /etc/hosts' % (domain, '127.0.0.1') + color_white)
            run('echo "%s %s" | sudo tee -a /etc/hosts' % ('127.0.0.1', domain), warn=True)


def generate_ssl():
    """
    Generate CRT (Black Magic)
    """
    ssl_dir = Config.local_dir + "infrastructure/services/local/nginx/ssl/"
    rootcrt = ssl_dir + "rootCA.crt"
    rootkey = ssl_dir + "rootCA.key"
    csr = ssl_dir + "capco.csr"
    pem = ssl_dir + "capco.pem"
    csrconf = ssl_dir + "capco.csr.cnf"
    csrv3 = ssl_dir + "v3.ext"
    key = ssl_dir + "capco.key"
    crt = ssl_dir + "capco.crt"
    pfx = ssl_dir + "capco.pfx"

    run('openssl req -new -sha256 -nodes -out %s -newkey rsa:2048 -keyout %s -config %s' % (csr, key, csrconf))
    run('openssl x509 -req -in %s -CA %s -CAkey %s -CAcreateserial -out %s -days 3000 -sha256 -extfile %s' % (csr, rootcrt, rootkey, crt, csrv3))
    run('cat %s %s > %s' % (crt, key, pem))
    run('openssl pkcs12 -export -inkey %s  -in %s -name "capco.dev" -out %s' % (key, pem, pfx))


def sign_ssl_linux():
    run('sudo cp infrastructure/services/local/nginx/ssl/rootCA.crt /etc/ssl/certs/')
    run('sudo cp infrastructure/services/local/nginx/ssl/rootCA.key /etc/ssl/private')


def sign_ssl_mac():
    run('sudo security add-trusted-cert -d -r trustAsRoot -k /Library/Keychains/System.keychain %s' % Config.local_dir + "infrastructure/services/local/nginx/ssl/capco.crt")
    run('symfony local:server:ca:install')


def sign_ssl():
    if _platform == "linux" or _platform == "linux2":
        sign_ssl_linux()
    elif _platform == "darwin":
        sign_ssl_mac()
    print(color_cyan + 'Successfully added HTTPS support !' + color_white)


def install_git_hook():
    """
    Install git hooks on your local machine.
    """
    run('cp codemod/git_hooks/prepare-commit-msg .git/hooks/prepare-commit-msg')
    run('sudo chmod 755 .git/hooks/prepare-commit-msg')

    print(color_cyan + 'Successfully install git hooks !' + color_white)

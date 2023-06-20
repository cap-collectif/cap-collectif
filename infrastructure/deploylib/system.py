from sys import platform as _platform
from fabric import Config
from invoke import run
import os
import subprocess


color_cyan = '\033[96m'
color_white = '\033[0m'
color_yellow = '\033[93m'


def linux_docker_install(force=False):
    """
    Install docker on linux
    """
    if Config.docker_machine:
        return

    run('curl -sSL https://get.docker.com/ | sh')
    run('curl -L https://github.com/docker/compose/releases/download/1.5.1/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose')
    run('sudo apt-get install unrar')


def doctor():
    if _platform == "darwin":
        print(color_yellow + "On MacOS, please use 'Docker Desktop for Mac' and dedicate at least 6GB of memory (Preferences > Resources > Memory)." + color_white)
    run('echo "Docker: ' + color_yellow + '`docker -v | grep -Eo \'[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}\'`"' + color_white)
    run('echo "Docker compose: ' + color_yellow + '`docker compose version | grep -Eo \'[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}\'`"' + color_white)
    run('echo "Node: ' + color_yellow + '`node -v | grep -Eo \'[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}\'`"' + color_white)
    run('echo "Yarn: ' + color_yellow + '`yarn -v | grep -Eo \'[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}\'`"' + color_white)
    if _platform == 'darwin':
        run('echo "PHP: ' + color_yellow + '`php -v | grep -Eo \'[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}\' | head -1`"' + color_white)
        run('php -m | grep -qi redis && echo "PHP extension: redis enabled" || echo "PHP extension: redis not found"' + color_white)
        run('php -m | grep -qi imagick && echo "PHP extension: imagick enabled" || echo "PHP extension: imagick not found"' + color_white)
        run('php -m | grep -qi amqp && echo "PHP extension: amqp enabled" || echo "PHP extension: amqp not found"' + color_white)
        run('echo "Composer: ' + color_yellow + '`composer --version | grep -Eo \'[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}\' | head -1`"' + color_white)
        run('echo "Symfony CLI: ' + color_yellow + ' `symfony -V | grep -Eo \'[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}\' | head -1`"' + color_white)


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
    # brew install symfony-cli/tap/symfony-cli
    run('brew install imagemagick')
    run('printf "\n" | pecl install imagick')
    run('printf "\n" | pecl install redis')
    run('echo $(brew --prefix rabbitmq-c) | pecl install amqp')


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
    Update /etc/hosts file with domains and setup Symfony proxy
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
        proxy_path = '~/.symfony5/proxy.json'
        run('symfony local:proxy:domain:attach capco', warn=True)

        if run('cat ' + proxy_path + ' | grep \'%s\'' % '"tld": "wip"', warn=True).stdout:
            run("sed -i .bak 's/\"tld\": \"wip\"/\"tld\": \"" + tld + "\"/g' " + proxy_path, warn=True)
        print(color_cyan + 'Successfully attached Symfony proxy domain to ' + color_yellow + 'capco.' + tld + color_white)

    run('echo "# Added by cap-collectif" | sudo tee -a /etc/hosts', warn=True)
    for domain in domains:
        if not run('cat /etc/hosts | grep %s | grep %s' % (domain, Config.local_ip), warn=True).stdout:
            print(color_cyan + '%s should point to %s in /etc/hosts' % (domain, Config.local_ip) + color_white)
            run('echo "%s %s" | sudo tee -a /etc/hosts' % (Config.local_ip, domain), warn=True)

    for domain in localhost_domains:
        if not run('cat /etc/hosts | grep %s | grep %s' % (domain, '127.0.0.1'), warn=True).stdout:
            print(color_cyan + '%s should point to %s in /etc/hosts' % (domain, '127.0.0.1') + color_white)
            run('echo "%s %s" | sudo tee -a /etc/hosts' % ('127.0.0.1', domain), warn=True)
    run('echo "# End of section" | sudo tee -a /etc/hosts', warn=True)


def generate_ssl():
    """
    Generate CRT (Black Magic)
    """

    if _platform == "darwin":
        print("Installing Symfony CLI local certificate authority...")
        run('symfony local:server:ca:install')

    print("Installing browser local certificate...")
    try:
        os.makedirs("infrastructure/services/local/nginx/ssl")
    except FileExistsError:
        print(color_yellow + "Directory `infrastructure/services/local/nginx/ssl` already exists, skipping creation." + color_white)

    if os.path.exists("infrastructure/services/local/nginx/ssl/capco.pem"):
        print(color_yellow + "Certificate `infrastructure/services/local/nginx/ssl/capco.pem` already exists, skipping generation." + color_white)
        return

    if subprocess.call(['which', 'mkcert']) != 0:
        raise Exception('mkcert is not installed, install it and try again')

    run("mkcert -install")
    run("mkcert -cert-file infrastructure/services/local/nginx/ssl/capco.crt -key-file infrastructure/services/local/nginx/ssl/capco.key *.cap.co capco.dev *.capco.dev capco.prod *.capco.prod capco.test *.capco.test capco.paris.fr")
    run("cat infrastructure/services/local/nginx/ssl/capco.crt > infrastructure/services/local/nginx/ssl/capco.pem")
    run("cat infrastructure/services/local/nginx/ssl/capco.key >> infrastructure/services/local/nginx/ssl/capco.pem")


def install_git_hook():
    """
    Install git hooks on your local machine.
    """
    run('cp codemod/git_hooks/prepare-commit-msg .git/hooks/prepare-commit-msg')
    run('sudo chmod 755 .git/hooks/prepare-commit-msg')

    print(color_cyan + 'Successfully install git hooks !' + color_white)

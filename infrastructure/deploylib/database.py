from fabric import Config, Connection
from infrastructure.deploylib.environments import command

environements = ['dev', 'test', 'prod']


def generate(migrate='false', environement='dev'):
    "Generate database"
    if environement in environements:
        # Delete media cache and source files
        command('rm -rf public/media/*', 'application')
        command('mkdir -p public/media', 'application')
        # command('php -d memory_limit=1024M bin/console debug:container --env-vars --env=' + environement, 'application', Config.www_app)
        command('php -d memory_limit=-1 bin/console capco:reinit --force --env=' + environement + ('', ' --migrate')[migrate == 'true'], 'application', Config.www_app)
    else:
        print("Option environment must be 'dev', 'test' or 'prod'.")


def mysqlconsole():
    "Access mysql"
    command('mysql -u root -h 127.0.0.1 symfony', 'application')


def importbdd():
    "Import dump.sql"
    command('cat dump.sql | mysql -u root symfony', 'application')

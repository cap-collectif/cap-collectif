from task import task
from fabric.api import env


@task(environments=['local', 'ci'])
def generate(populate='true', migrate='false'):
    "Generate database"
    env.service_command('rm -rf web/media/*', 'application')
    env.service_command('php bin/console capco:reinit --force ' + ('', ' --migrate')[migrate == 'true'] + ('', ' --no-es-populate')[populate != 'true'], 'application', env.www_app)


@task(environments=['local'])
def mysqlconsole():
    "Access mysql"
    env.service_command('mysql -u root -h 127.0.0.1 symfony', 'application')


@task(environments=['local'])
def importbdd():
    "Import dump.sql"
    env.service_command('cat dump.sql | mysql -u root symfony', 'application')

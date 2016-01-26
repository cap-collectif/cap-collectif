from task import task
from fabric.api import env


@task(environments=['local', 'testing'])
def generate():
    "Generate database"
    env.service_command('php bin/console capco:reinit --force --no-es-populate', 'application', env.www_app)


@task(environments=['local'])
def mysqlconsole():
    "Access mysql"
    env.service_command('mysql -u root -h 127.0.0.1 symfony', 'application')


@task(environments=['local'])
def importbdd():
    "Import dump.sql"
    local('eval "$(docker-machine env capco)" && cat dump.sql | docker exec -i capcollectifsf2_application_1 /bin/bash -c "mysql -u root symfony"')

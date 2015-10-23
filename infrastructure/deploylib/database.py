from task import task
from fabric.api import env


@task
def mysql_console():
    env.service_command('mysql -u root -h 127.0.0.1 symfony', 'application')

@task
def import_bdd():
    local('eval "$(docker-machine env capco)" && cat dump.sql | docker exec -i capcollectifsf2_application_1 /bin/bash -c "mysql -u root symfony"')

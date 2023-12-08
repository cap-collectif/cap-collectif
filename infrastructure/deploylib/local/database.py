from invoke import task
from infrastructure.deploylib import database, environments


@task
def generate(ctx, migrate='false', environment='dev'):
    environments.local()
    database.generate(migrate, environment)


@task
def importbdd(ctx):
    environments.local()
    database.importbdd()

@task
def mysqlconsole(ctx):
    environments.local()
    database.mysqlconsole()

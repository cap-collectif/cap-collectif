from invoke import task
from infrastructure.deploylib import database, environments


@task
def generate(ctx, migrate='false', environment='dev'):
    environments.ci()
    database.generate(migrate, environment)

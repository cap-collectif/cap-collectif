from invoke import task
from infrastructure.deploylib import app, environments


@task
def deploy(ctx):
    environments.ci()
    app.deploy()


@task
def prepare_php(ctx, environment='dev'):
    environments.ci()
    app.prepare_php(environment)


@task
def rabbitmq_queues(ctx):
    environments.ci()
    app.rabbitmq_queues()


@task
def start_consumers(ctx):
    environments.ci()
    app.start_consumers()


@task
def toggle_disable(ctx, toggle='public_api', environment='test'):
    environments.ci()
    app.toggle_disable(toggle, environment)


@task
def toggle_enable(ctx, toggle='public_api', environment='test'):
    environments.ci()
    app.toggle_enable(toggle, environment)

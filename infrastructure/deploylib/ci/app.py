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
def swarrot_consume(ctx, name):
    environments.ci()
    app.swarrot_consume(name)


@task
def toggle_disable(ctx, toggle='public_api', environment='test'):
    environments.ci()
    app.toggle_disable(toggle, environment)


@task
def toggle_enable(ctx, toggle='public_api', environment='test'):
    environments.ci()
    app.toggle_enable(toggle, environment)

@task
def cmd(ctx, commandName='', environment='test'):
    environments.ci()
    app.cmd(commandName, environment)

@task
def sql(ctx, sql='', environment='test'):
    environments.ci()
    app.sql(sql, environment)

@task
def run_sql(ctx, sql, environment='test'):
    environments.local()
    app.run_sql(sql, environment)

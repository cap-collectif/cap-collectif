from invoke import task
from infrastructure.deploylib import app, environments


@task
def clean(ctx):
    environments.local()
    app.clean()


@task
def clear_cache(ctx, environment='dev'):
    environments.local()
    app.clear_cache(environment)


@task
def cmd(ctx, commandName='', environment='dev'):
    environments.local()
    app.cmd(commandName, environment)

@task
def sql(ctx, sql='', environment='dev'):
    environments.local()
    app.sql(sql, environment)


@task
def deploy(ctx):
    environments.local()
    app.deploy()


@task
def prepare_php(ctx, environment='dev'):
    environments.local()
    app.prepare_php(environment)


@task
def rabbitmq_queues(ctx):
    environments.local()
    app.rabbitmq_queues()


@task
def setup_default_env_vars(ctx):
    environments.local()
    app.setup_default_env_vars()


@task
def ssh(ctx, user='capco'):
    environments.local()
    app.ssh(user)


@task
def start_consumers(ctx):
    environments.local()
    app.start_consumers()

@task
def swarrot_consume(ctx, name):
    environments.ci()
    app.swarrot_consume(name)


@task
def stop_consumers(ctx):
    environments.local()
    app.stop_consumers()


@task
def toggle_disable(ctx, toggle='public_api', environment='test'):
    environments.local()
    app.toggle_disable(toggle, environment)


@task
def toggle_enable(ctx, toggle='public_api', environment='test'):
    environments.local()
    app.toggle_enable(toggle, environment)

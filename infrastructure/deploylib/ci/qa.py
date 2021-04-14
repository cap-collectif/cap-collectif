from invoke import task
from infrastructure.deploylib import qa, environments


@task
def behat(ctx, fast_failure='true', profile='false', suite='false', tags='false', timer='true'):
    environments.ci()
    qa.behat(fast_failure, profile, suite, tags, timer)


@task
def graphql_schemas(ctx, checkSame=False):
    environments.ci()
    qa.graphql_schemas(checkSame)


@task
def purge_rabbitmq(ctx):
    environments.ci()
    qa.purge_rabbitmq()


@task
def restore_db(ctx):
    environments.ci()
    qa.restore_db()


@task
def restore_es_snapshot(ctx):
    environments.ci()
    qa.restore_es_snapshot()


@task
def save_db(ctx):
    environments.ci()
    qa.save_db()


@task
def save_es_snapshot(ctx):
    environments.ci()
    qa.save_es_snapshot()

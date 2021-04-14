from invoke import task
from infrastructure.deploylib import qa, environments


@task
def behat(ctx, fast_failure='true', profile='false', suite='false', tags='false', timer='true'):
    environments.local()
    qa.behat(fast_failure, profile, suite, tags, timer)


@task
def blackfire_curl(ctx, url):
    environments.local()
    qa.blackfire_curl(url)


@task
def blackfire_run(ctx, cli):
    environments.local()
    qa.blackfire_curl(cli)


@task
def clear_fixtures(ctx):
    environments.local()
    qa.clear_fixtures()


@task
def compile_graphql(ctx):
    environments.local()
    qa.compile_graphql()


@task
def graphql_schemas(ctx, checkSame=False):
    environments.local()
    qa.graphql_schemas(checkSame)


@task
def kill_database_container(ctx):
    environments.local()
    qa.kill_database_container()


@task
def phpspec(ctx, desc='false'):
    environments.local()
    qa.phpspec(desc)


@task
def purge_rabbitmq(ctx):
    environments.local()
    qa.purge_rabbitmq()


@task
def restore_db(ctx):
    environments.local()
    qa.restore_db()


@task
def restore_es_snapshot(ctx):
    environments.local()
    qa.restore_es_snapshot()


@task
def save_db(ctx):
    environments.local()
    qa.save_db()


@task
def save_es_snapshot(ctx):
    environments.local()
    qa.save_es_snapshot()


@task
def snapshots(ctx, tags='false'):
    environments.local()
    qa.snapshots(tags)


@task
def view(ctx, firefox='false'):
    environments.local()
    qa.view(firefox)

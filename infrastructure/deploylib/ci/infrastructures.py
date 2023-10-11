from invoke import task
from infrastructure.deploylib import infrastructures, environments


@task
def build(ctx, use_cache='true'):
    environments.ci()
    infrastructures.build(use_cache)


@task
def up(ctx, force_recreate='false', no_cache='false', mode='symfony_bin', build_at_up=False):
    environments.ci()
    infrastructures.up(force_recreate, no_cache, mode, build_at_up)

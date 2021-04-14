from invoke import task
from infrastructure.deploylib import infrastructures, environments


@task
def build(ctx, use_cache='true'):
    environments.local()
    infrastructures.build(use_cache)


@task
def clean(ctx):
    environments.local()
    infrastructures.clean()


@task
def logs(ctx, containers=''):
    environments.local()
    infrastructures.logs(containers)


@task
def ps(ctx):
    environments.local()
    infrastructures.ps()


@task
def reboot(ctx, mode='symfony_bin'):
    environments.local()
    infrastructures.reboot(mode)


@task
def stop(ctx, mode='symfony_bin'):
    environments.local()
    infrastructures.stop(mode)


@task
def up(ctx, force_recreate='false', no_cache='false', mode='symfony_bin'):
    environments.local()
    infrastructures.up(force_recreate, no_cache, mode)

from invoke import task
from infrastructure.deploylib import system, environments


@task
def configure_vhosts(ctx, mode='symfony_bin'):
    environments.local()
    system.configure_vhosts(mode)


@task
def generate_ssl(ctx):
    environments.local()
    system.generate_ssl()


@task
def install_git_hook(ctx):
    environments.local()
    system.install_git_hook()


@task
def linux_docker_install(ctx, force=False):
    environments.local()
    system.linux_docker_install(force)


@task
def symfony_bin_install(ctx, force=False):
    environments.local()
    system.symfony_bin_install(force)

@task
def doctor(ctx):
    environments.local()
    system.doctor()

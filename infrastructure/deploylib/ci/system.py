from invoke import task
from infrastructure.deploylib import system, environments


@task
def generate_ssl(ctx):
    environments.ci()
    system.generate_ssl()


@task
def install_git_hook(ctx):
    environments.ci()
    system.install_git_hook()


@task
def sign_ssl(ctx):
    environments.ci()
    system.sign_ssl()


@task
def symfony_bin_install(ctx, force=False):
    environments.ci()
    system.symfony_bin_install(force)

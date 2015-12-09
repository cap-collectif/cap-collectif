from task import task
from fabric.operations import local, run, settings
from fabric.api import env

@task
def deploy(environment='dev'):
    "Deploy"
    env.compose('run builder build')

@task
def ssh():
    "Ssh into application container"
    env.ssh_into('application')

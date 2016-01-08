import types
import inspect
import environments

from fabric import tasks
from fabric import state
from fabric.task_utils import _Dict
from functools import wraps
from fabric.api import env

state.env.new_style_tasks = True


def task(*args, **kwargs):
    invoked = bool(not args or kwargs)
    task_class = kwargs.pop("task_class", tasks.WrappedCallableTask)

    if not invoked:
        func, args = args[0], ()

    def wrapper(func):
        task_name = kwargs.pop("name", func.__name__)
        env_list = kwargs.pop("environments", [])

        for name, env in environments.environments.iteritems():
            if env_list and name not in env_list:
                continue

            env_task_name = '%s%s.%s' % (name, func.__module__.replace('infrastructure.deploylib', '').replace('fabfile', ''), task_name)
            function = wrapenv(env, func, env_task_name)
            insert_command(env_task_name, task_class(function, *args, **kwargs), state.commands)

        return func

    return wrapper if invoked else wrapper(func)


def wrapenv(envconfig, function, task_name):
    @wraps(function)
    def envfunc(*args, **kwargs):
        envconfig()
        env.current_task_name = task_name
        function(*args, **kwargs)

    return envfunc


def insert_command(name, command, mapping):
    key, _, rest = name.partition('.')

    if not rest:
        mapping[key] = command
        return

    if key not in mapping:
        mapping[key] = _Dict()

    return insert_command(rest, command, mapping[key])

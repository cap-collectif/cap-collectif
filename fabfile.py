from __future__ import with_statement
from infrastructure.deploylib import ci_tasks, local_tasks
from invoke import Collection, task


namespace = Collection()
namespace.add_collection(ci_tasks, 'ci')
namespace.add_collection(local_tasks, 'local')

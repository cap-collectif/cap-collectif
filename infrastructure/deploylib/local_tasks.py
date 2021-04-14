from invoke import Collection
from infrastructure.deploylib.local import app, database, infrastructures, qa, system

ns = Collection()
ns.add_collection(app)
ns.add_collection(database)
ns.add_collection(infrastructures)
ns.add_collection(qa)
ns.add_collection(system)

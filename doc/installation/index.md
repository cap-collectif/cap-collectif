# Installation

### Docker dev environment

L'environement de développement est basé sur Docker.

#### Prérequis

On va utiliser Fabric pour faciliter l'intéraction développeur / environement de développement.

```
# vérifier que pip est installé
$ pip --version

# builder les dépendances
$ sudo pip install -r requirements.txt
```

Pour lister les commandes disponibles : ``fab -l``

Pour la suite des prérequis cela dépend de votre OS : [OSX](osx.md) ou [Linux](linux.md).

#### Installation

```
# build l’archi du projet, c'est long, café, blabla, chatouiller quelqu'un
docker-compose build

# On télécharge toutes les dépendances (composer, npm, bower, ...)
docker-compose run builder

# On démarre le projet
docker-compose up -d application

# attendre, observer avec
docker-compose logs

# Lorsque "NOTICE: ready to handle connections" est visible vous pouvez accèder à http://capco.dev

# puis quand tout s’est arrêté, si on veut accéder à l'instance
docker exec -ti capcollectifsf2_application_1 bash

# pour monter les fixtures, dans la console du container
bin/console capco:reinit --force   # reset la base et charge les fixtures de dev
bin/console capco:load-base-data --force # charge les fixtures de base lors de la création d'une instance
bin/console import:pjl-from-csv # charge les données de base pour republique-numerique.fr

# si on veut partir d'une bdd existante
# placer le sql en fichier dump.sql à la racine du repo et lancer
fab docker_import_bdd

# si on veut rebuilder
docker-compose run builder
```

### Without Docker dev environment

- [Node / npm](http://nodejs.org/)
- [Bower](http://bower.io/)
- [Brunch](https://github.com/brunch/brunch)
- [Composer](https://getcomposer.org/)
- [Redis](http://redis.io/)
- [Elasticsearch](https://www.elastic.co/)
- [MariaDB](https://mariadb.org/)

You must run ``redis-server``, ``elasticsearch`` and ``mysql.server start`` in order to use the application.

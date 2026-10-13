# ADR 001 - Remplacer Fabric par Castor

## Contexte

Le projet utilise actuellement Fabric/Invoke pour orchestrer les environnements
locaux et la CI. Les tâches sont réparties dans `fabfile.py` et
`infrastructure/deploylib/`, et sont exécutées avec Python et Pipenv.

Cette organisation présente plusieurs inconvénients :

- elle impose Python, Pipenv et un ensemble de dépendances Python uniquement
  pour lancer les tâches du projet ;
- elle ajoute une seconde pile technique à côté de Symfony, Composer et PHP ;
- elle duplique une partie des tâches entre les contextes `local` et `ci` ;
- elle rend les commandes utilisées par CircleCI, Jest, Cypress et les scripts
  locaux dépendantes de Fabric ;
- elle ajoute une couche d'abstraction autour de commandes Docker et Symfony
  qui sont déjà exécutées depuis un projet PHP.

Le projet utilise PHP pour son application, ses commandes Symfony et ses outils
de qualité. La migration doit donc uniformiser le langage des tâches de projet
et supprimer la dépendance Python dédiée à Fabric.

## Décision

Nous remplaçons Fabric/Invoke par Castor comme task runner du projet.

Les tâches Castor seront écrites en PHP et organisées par domaines fonctionnels
dans `.castor/`, avec un point d'entrée `castor.php` à la racine. Les namespaces
`local` et `ci` seront conservés conceptuellement afin de séparer les usages
locaux et ceux de la CI. La syntaxe cible sera celle de Castor, par exemple
`castor local:infrastructures:up` et `castor ci:qa:phpunit`.

La migration devra :

1. porter les primitives communes d'exécution de commandes, Docker Compose,
   Docker, SSH/SCP, environnements et fusion des fichiers YAML ;
2. porter les tâches réellement utilisées par le développement local, la CI,
   Jest et Cypress ;
3. remplacer tous les appelants Fabric et mettre à jour la documentation ;
4. vérifier les comportements et les tests existants avant de supprimer
   Fabric, Pipenv et les fichiers Python devenus inutiles ;
5. utiliser une version de Castor déterministe en local et en CI.

L'installation de Castor devra être compatible avec l'environnement du projet.
Le projet cible actuellement PHP 8.1, alors que la version actuelle de
`jolicode/castor` nécessite PHP 8.4 ou supérieur lorsqu'elle est installée
comme dépendance Composer. Castor pourra néanmoins être utilisé via son
binaire statique, qui embarque son propre PHP et ne modifie pas le runtime PHP
8.1 de l'application. Ce choix devra être validé en local et dans la CI avant
le portage des tâches.

## Alternatives

- **Conserver Fabric/Invoke** : ne demande pas de migration immédiate, mais
  conserve la dépendance Python et la double pile technique.
- **Remplacer Fabric par Make ou des scripts shell** : réduit les dépendances,
  mais réintroduit une logique multi-plateforme et ne rapproche pas les tâches
  du code PHP/Symfony.
- **Créer uniquement des commandes Symfony** : cohérent avec PHP, mais moins
  adapté aux tâches qui doivent fonctionner avant le démarrage de l'application
  ou piloter Docker Compose.
- **Utiliser Castor** : conserve un task runner dédié, apporte l'exécution de
  processus, les arguments, l'interactivité et l'organisation par namespaces,
  tout en permettant d'écrire les tâches en PHP. Cette option est retenue.

## Conséquences

### Positives

- suppression progressive de Python, Pipenv, Fabric et Invoke du workflow ;
- tâches et scripts écrits dans le même langage que l'application ;
- intégration plus directe avec Composer, Symfony Process et Symfony YAML ;
- commandes locales et CI plus faciles à découvrir et à documenter ;
- réduction du nombre d'environnements d'exécution à installer pour contribuer.

### Négatives et risques

- réécriture des tâches existantes et de leurs wrappers `local`/`ci` ;
- migration de tous les appelants dans CircleCI, Jest, Cypress, scripts et
  documentation ;
- risque de régression sur les arguments shell, les codes de retour, les TTY,
  les snapshots MySQL/Elasticsearch et les commandes interactives ;
- nécessité de choisir et de maintenir une distribution de Castor compatible
  avec les postes de développement et les images CI, sans confondre le PHP
  embarqué par Castor avec le PHP 8.1 de l'application ;
- les tâches de déploiement ou d'exploitation utilisées hors du dépôt devront
  être inventoriées avant suppression de Fabric.

La migration ne modifie pas le runtime de l'application en production. Elle
peut toutefois modifier les outils utilisés pour construire, tester ou déployer
les environnements ; ces usages doivent donc être validés séparément.

## Statut

Proposé

## Références

- [`ADR/001-continuous_integration.md`](001-continuous_integration.md)
- [`ADR/001-preprod_deployment_process.md`](001-preprod_deployment_process.md)
- [`Pipfile`](../Pipfile)
- [`fabfile.py`](../fabfile.py)
- [`infrastructure/deploylib/`](../infrastructure/deploylib/)
- [Castor - Basic usage](https://castor.jolicode.com/docs/getting-started/basic-usage/)
- [Castor - Executing processes](https://castor.jolicode.com/docs/getting-started/run/)
- [Castor - SSH and remote servers](https://castor.jolicode.com/docs/going-further/helpers/ssh/)

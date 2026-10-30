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

Castor remplace Fabric/Invoke uniquement pour les commandes des développeurs en
local. Les tâches PHP de `.castor/`, chargées par `castor.php`, exposent les
namespaces `app:*`, `database:*`, `infrastructures:*`, `qa:*` et `system:*`,
ainsi que leurs alias courts. Le préfixe `local:` est supprimé puisque toutes
les tâches Castor sont locales. Le binaire statique est épinglé dans
`.castor-version` et conserve son runtime indépendant du PHP applicatif.

La CI, la QA et les hooks automatisés Jest/Cypress exécutent directement Docker,
Compose, Symfony et les outils de test. Ils ne doivent ni installer ni invoquer
Castor. Les anciens wrappers `ci:*` et l'installateur CircleCI sont supprimés,
y compris dans le job qui construit les images CI/QA. Les Dockerfiles de ces
images n'installent pas Castor.

Deux opérations nécessitent une logique dédiée : la sélection PHPUnit multifichier
et les instantanés Elasticsearch. Elles vivent dans `scripts/qa/` et s'exécutent
avec le PHP du conteneur applicatif. Les commandes Castor locales délèguent aux
mêmes scripts afin de conserver les comportements sans dupliquer cette logique.
Les requêtes SQL et les overrides JSON sont transmis comme des arguments distincts
avec `execFile`, sans interpolation shell.

## Alternatives

- Conserver Castor en CI : ajoute une installation et une couche d'orchestration
  inutiles pour des commandes déjà explicites dans le pipeline.
- Remplacer Castor par un autre task runner en CI : conserve la même dépendance
  d'orchestration et ne répond pas au besoin.

## Conséquences

- Les développeurs conservent les commandes Castor locales et leur ergonomie.
- La CI/QA ne dépend plus du binaire Castor ni de son téléchargement.
- Les scripts de test conservent les codes d'échec, rapports JUnit, modes de
  restauration MySQL et gestion des snapshots/alias Elasticsearch.
- Toute nouvelle opération automatisée doit appeler ses commandes directement.

## Statut

Accepté

## Références

- [Intégration continue](001-continuous_integration.md)
- [Installation locale](../doc/installation-locale.md)
- [Scripts QA](../scripts/qa/README.md)

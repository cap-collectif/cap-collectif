# Migration de Fabric vers Castor

## Objectif

Remplacer Fabric/Invoke par Castor afin de supprimer la dépendance Python
dédiée aux tâches du projet et d'uniformiser ces tâches en PHP.

La migration doit préserver les comportements utiles avant de supprimer
Fabric. Les commandes doivent rester exécutables depuis la racine du dépôt et
leurs erreurs doivent continuer à faire échouer l'appelant.

## État actuel

Les éléments à migrer sont principalement dans :

- `fabfile.py` : point d'entrée et collections `local` / `ci` ;
- `infrastructure/deploylib/` : tâches Fabric/Invoke et logique partagée ;
- `Pipfile` et `Pipfile.lock` : dépendances Python ;
- `.circleci/requirements.txt` : installation CI de Fabric ;
- `.circleci/config.yml` et `.circleci/test-data.sh` : appels CI ;
- `package.json`, hooks Jest et plugins Cypress : appels
  locaux ou liés aux tests ;
- `AGENTS.md`, `WARP.md`, `README.md` et `admin-next/README.md` : commandes et
  instructions à mettre à jour.

Les tâches couvrent notamment :

- démarrage, arrêt, reconstruction, logs et inspection de Docker Compose ;
- fusion des fichiers Compose selon l'environnement ;
- installation et déploiement local de l'application ;
- commandes Symfony, Composer, SQL et feature flags ;
- queues RabbitMQ et consommateurs Swarrot ;
- génération/restauration des dumps MySQL ;
- sauvegarde/restauration des snapshots Elasticsearch ;
- compilation et export des schémas GraphQL ;
- PHPUnit, PHPSpec, snapshots d'exports et opérations Blackfire ;
- configuration locale, certificats, hooks Git et diagnostic système.

## Résultats de la tâche 1 : inventaire et contrat

### Inventaire des tâches exposées

L'inventaire des wrappers `local` et `ci` donne 67 tâches : 44 tâches locales
et 23 tâches CI. Les modules partagent une logique Python commune située dans
`infrastructure/deploylib/`.

| Contexte | Namespace | Nombre | Tâches inventoriées |
| --- | --- | ---: | --- |
| Développement local | `local:app` | 14 | `clear-cache`, `cmd`, `composer`, `sql`, `deploy`, `prepare-php`, `rabbitmq-queues`, `setup-default-env-vars`, `ssh`, `start-consumers`, `swarrot-consume`, `stop-consumers`, `toggle-disable`, `toggle-enable` |
| Développement local | `local:database` | 3 | `generate`, `importbdd`, `mysqlconsole` |
| Développement local | `local:infrastructures` | 7 | `build`, `clean`, `logs`, `ps`, `reboot`, `stop`, `up` |
| Développement local | `local:qa` | 14 | `blackfire-curl`, `blackfire-run`, `clear-fixtures`, `compile-graphql`, `graphql-schemas`, `kill-database-container`, `phpspec`, `phpunit`, `purge-rabbitmq`, `restore-db`, `restore-es-snapshot`, `save-db`, `save-es-snapshot`, `snapshots` |
| Développement local | `local:system` | 6 | `configure-vhosts`, `generate-ssl`, `install-git-hook`, `linux-docker-install`, `symfony-bin-install`, `doctor` |
| CI | `ci:app` | 10 | `deploy`, `prepare-php`, `rabbitmq-queues`, `start-consumers`, `swarrot-consume`, `toggle-disable`, `toggle-enable`, `cmd`, `sql`, `run-sql` |
| CI | `ci:database` | 1 | `generate` |
| CI | `ci:infrastructures` | 2 | `build`, `up` |
| CI | `ci:qa` | 7 | `graphql-schemas`, `purge-rabbitmq`, `restore-db`, `restore-es-snapshot`, `save-db`, `save-es-snapshot`, `phpunit` |
| CI | `ci:system` | 3 | `generate-ssl`, `install-git-hook`, `symfony-bin-install` |

### Inventaire des appelants et impacts

| Zone | Fichiers ou usages trouvés | Impact de la migration | Décision au portage |
| --- | --- | --- | --- |
| Développement local | `package.json`, `doc/installation-locale.md`, `admin-next/README.md` | Installation et commandes quotidiennes | Remplacer par `castor local:*` et documenter l'installation du binaire versionné |
| CI | `.circleci/config.yml`, `.circleci/test-data.sh`, `.circleci/requirements.txt` | Installation de l'outil, démarrage Docker, fixtures, dumps, PHPUnit et artefacts | Installer Castor avant les jobs et supprimer l'installation Fabric/Python dédiée |
| Tests Jest/API | `jest-setup.e2e.js`, `jest-setup-global.e2e.js`, `features/graphql-api/` | Sauvegarde/restauration DB et Elasticsearch, SQL et commandes Symfony | Préserver les sorties et codes de retour ; tester les hooks avant suppression de Fabric |
| Tests Cypress | `cypress/plugins/index.ts`, specs Cypress directes | RabbitMQ, snapshots, feature flags, consommateurs et commandes Symfony | Remplacer les appels par Castor et vérifier les hooks `before:run`/`after:run` |
| Documentation | `AGENTS.md`, `WARP.md`, `README.md`, `REFONTE_SONATA.md`, `docs/tests/`, audits et README de tests | Instructions, exemples et contraintes de contribution obsolètes | Mettre à jour après validation du nouveau runner |
| Production/déploiement | `.circleci/instance-deployment.sh` appelle un service externe par HTTP ; aucun appel `fab` direct trouvé dans ce script | Pas d'impact production identifié dans le dépôt | Confirmer séparément les runbooks et services externes avant de supprimer Fabric |

### Contrat de compatibilité retenu

| Sujet | Contrat cible |
| --- | --- |
| Nommage | Utiliser les namespaces Castor `local:*` et `ci:*`; ne pas maintenir une compatibilité artificielle avec les points Fabric |
| Installation | Préférer un binaire statique Castor versionné ; ne pas ajouter la version actuelle de Castor aux dépendances Composer PHP 8.1 sans résolution explicite de sa contrainte PHP 8.4 |
| Environnement applicatif | Castor orchestre les commandes depuis l'hôte ; les commandes Symfony, PHP, Composer et les outils de test continuent de s'exécuter dans les conteneurs existants |
| Erreurs | Toute commande échouée doit retourner un code non nul et faire échouer l'appelant CI ou test |
| Arguments | Les options existantes doivent rester disponibles ; les arguments shell seront transmis de façon sûre, en privilégiant les tableaux d'arguments |
| Interactivité | Les usages SSH, TTY, console MySQL, logs et consommateurs doivent conserver un mode interactif quand le terminal le permet |
| Données de test | Les sauvegardes/restaurations MySQL et Elasticsearch, RabbitMQ et les snapshots doivent conserver leurs fichiers, chemins et séquences actuels |
| Production | Aucun changement du runtime applicatif n'est prévu ; tout usage externe de Fabric doit être confirmé avant le nettoyage |

### Découpage Git

Chaque commande individuelle listée dans le tableau des tâches constitue une
unité de migration et doit produire un commit atomique. Un commit peut toucher
plusieurs fichiers si nécessaire pour porter cette commande et ses appelants,
mais il ne doit pas mélanger plusieurs tâches du tableau.

Les prérequis transverses qui ne correspondent pas à une commande, comme le
bootstrap Castor, la configuration commune ou l'installation CI, doivent être
traités dans des commits séparés avant les commits de tâches.

Les commits suivent les conventions du projet : message Conventional Commit en
anglais, au présent, terminé par `(#16850)`.

### Progression de l'implémentation

| Périmètre | État | Détail |
| --- | --- | --- |
| Socle Castor | Porté | `castor.php`, version `v1.8.1`, installation statique, helpers Docker et exécution applicative |
| Tâches locales Docker, base et application | Porté | Les commandes actives sont portées, y compris `setup-default-env-vars` |
| Tâches locales QA | Porté | PHPUnit, PHPSpec, GraphQL, snapshots, MySQL, Elasticsearch, RabbitMQ et Blackfire ; les opérations destructives demandent `--confirm` |
| Tâches locales système | Porté | Diagnostic, vhosts, certificats et hook Git portés ; les installations de dépendances système restent hors périmètre |
| Tâches CI Docker, base, application et QA | Partiel | Wrappers actifs portés ; `ci:app:run-sql` n'est pas repris car l'implémentation Fabric appelle une fonction inexistante |
| Appelants de tests et scripts locaux | Partiel | Package scripts, hooks Jest, plugin Cypress et helpers principaux migrés ; l'ancien script `good-morning.sh` a été supprimé |
| Workflows CircleCI et nettoyage Python | Porté | Castor est installé depuis `.castor-version`, les appels actifs sont remplacés et Fabric/Pipenv sont supprimés |

La restauration Elasticsearch partagée vérifie la présence de `analytics_test`,
supprime les anciens index `capco_*`, `capco_restore_*`, les éventuels
`castor_restore_*` hérités et `analytics_test`, puis restaure les index avec le
préfixe temporaire `capco_restore_` avant de déplacer les alias applicatifs. Ce
comportement est volontairement destructif et doit rester limité à l'usage QA.

### Tâches Fabric non reprises

Fabric expose 67 tâches contre 63 tâches Castor. Les quatre tâches suivantes ne
sont pas reprises :

| Tâche Fabric | Comportement historique | Motif de non-portage |
| --- | --- | --- |
| `ci:app:run-sql` | Appelle `app.run_sql(sql, environment)` après avoir configuré l'environnement local | `app.run_sql` n'existe pas dans `infrastructure/deploylib/app.py`. La tâche est donc cassée ; `ci:app:sql`, qui utilise `app.sql`, couvre le besoin fonctionnel valide. |
| `local:system:linux-docker-install` | Installe Docker avec `curl \| sh` puis `apt-get install unrar` | Installation système destructive et dépendante de Debian/Ubuntu. Docker est désormais un prérequis explicite, vérifié par `local:system:doctor` et démarré par Castor si nécessaire sur macOS. |
| `local:system:symfony-bin-install` | Installe PHP, Composer, Symfony CLI et extensions PHP via Homebrew | Installation de dépendances système hors du périmètre du projet, non portable et sans appelant interne identifié. Les prérequis sont documentés dans `doc/installation-locale.md`. |
| `ci:system:symfony-bin-install` | Réutilise la même installation Homebrew dans l'environnement CI | Même raison ; l'image CI doit fournir ses outils, et aucun appelant interne n'a été trouvé. |

Ces quatre tâches n'ont donc pas d'équivalent Castor volontairement. Toute
réutilisation depuis un runbook ou un script externe devra être traitée comme
un nouveau besoin avant d'ajouter une tâche Castor.

## Cible Castor

Créer un point d'entrée `castor.php` à la racine et déplacer les tâches dans
`.castor/`. Les fonctions Castor seront regroupées par namespace :

```text
.castor/
  app.php
  database.php
  infrastructures.php
  qa.php
  system.php
  ci.php
  ci_app.php
  ci_database.php
  ci_qa.php
  ci_system.php
```

Exemples de commandes cibles :

```text
castor local:infrastructures:up
castor local:database:generate --environment=dev
castor local:app:cmd --command-name="cache:clear"
castor ci:qa:phpunit --tests="tests/Command/MigrationCommandTest.php"
castor ci:qa:restore-db
```

Les noms exacts peuvent être ajustés pendant l'implémentation, mais il faut
éviter de conserver une couche de compatibilité complexe uniquement pour
reproduire la syntaxe Fabric avec des points.

## Plan d'actions

### 1. Inventaire et contrat de compatibilité

- [x] Lister les 67 tâches exposées par `fabfile.py` et leurs namespaces
      `local`/`ci`.
- [ ] Confirmer, pour chaque tâche, les usages encore actifs et les tâches
      obsolètes avant de les porter.
- [x] Rechercher les appels `fab` et `pipenv run fab` dans tout le dépôt.
- [ ] Confirmer les éventuels appels Fabric dans les runbooks ou scripts
      externes au dépôt.
- [x] Décider provisoirement d'utiliser un binaire statique Castor versionné,
      sous réserve de validation sur macOS, Linux et dans l'image CI.
- [x] Écarter l'ajout direct de la version actuelle de `jolicode/castor` aux
      dépendances Composer du projet PHP 8.1.
- [x] Définir la correspondance des tâches et des options Fabric vers Castor.
- [x] Définir le comportement attendu pour les codes de retour, stdout/stderr,
      TTY, commandes interactives, arguments et variables d'environnement.

### 2. Socle Castor

- [x] Ajouter `castor.php` et les fichiers `.castor/`.
- [x] Ajouter une commande de vérification de version utilisable localement et
      dans la CI.
- [x] Porter l'exécution de commandes vers `run()` ou Symfony Process en
      privilégiant les arguments sous forme de tableau pour éviter les erreurs
      de quoting.
- [x] Porter la configuration explicite des environnements `local` et `ci`.
- [x] Porter la fusion des fichiers Compose et la gestion du fichier YAML
      temporaire.
- [x] Porter les opérations `docker exec`, `docker compose`, SSH/SCP et les
      commandes interactives nécessaires.
- [ ] Éviter les états globaux mutables de `Config` ; passer la configuration
      nécessaire explicitement aux fonctions communes.

### 3. Tâches de développement local

- [x] Porter `local:infrastructures:*` : build, up, stop, reboot, clean, ps et
      logs.
- [x] Porter `local:database:*` : generate, importbdd et mysqlconsole.
- [x] Porter `local:app:*` : deploy, prepare-php, clear-cache, composer, cmd,
      sql, feature flags, queues, consommateurs et SSH.
- [x] Porter `local:qa:*` : compilation GraphQL, dumps de schémas, PHPUnit,
      PHPSpec, snapshots, restauration DB/Elasticsearch, RabbitMQ et Blackfire.
- [x] Porter `local:system:*` : diagnostic, certificats, hooks et configuration
      des vhosts.
- [x] Supprimer l'ancien script `good-morning.sh`, devenu obsolète après la migration.
- [x] Mettre à jour les scripts Yarn qui invoquent actuellement Fabric.
- [x] Mettre à jour les instructions de développement dans `AGENTS.md`,
      `WARP.md`, `README.md` et `admin-next/README.md`.

### 4. CI

- [x] Installer une version fixe de Castor dans les jobs CircleCI avant les
      premières tâches qui l'utilisent, sans supposer que le PHP 8.1 de
      l'application suffit à exécuter la version actuelle de Castor.
- [x] Remplacer les appels dans `.circleci/config.yml` et
      `.circleci/test-data.sh`.
- [x] Remplacer les étapes `ci:infrastructures:*`, `ci:database:*`,
      `ci:app:*` et `ci:qa:*`.
- [x] Supprimer l'installation de Fabric, Paramiko et des autres dépendances
      Python devenues inutiles pour la CI.
- [x] Supprimer ou adapter le cache Python si aucune autre étape ne l'utilise.
- [x] Vérifier que les jobs conservent leurs codes d'échec, leurs logs et leurs
      artefacts JUnit.
- [x] Vérifier le démarrage des stacks Docker indépendantes et la restauration
      des données conformément à [`ADR/001-continuous_integration.md`](../ADR/001-continuous_integration.md).

### 5. Tests et hooks d'intégration

- [x] Remplacer les appels Fabric dans `jest-setup.e2e.js` et
      `jest-setup-global.e2e.js`.
- [x] Remplacer les appels du plugin Cypress : sauvegarde/restauration DB et
      Elasticsearch, purge RabbitMQ, feature flags, commandes Symfony et
      consommateurs.
- [x] Remplacer les appels directs dans les specs Cypress et les helpers
      `features/graphql-api/`.
- [x] Vérifier que les retours à la ligne sont refusés dans les arguments des
      commandes Castor ; ce contrôle est exécuté dans le job de qualité CI.
- [ ] Vérifier les commandes avec arguments contenant espaces, guillemets,
      caractères spéciaux ou valeurs vides.
- [ ] Vérifier les commandes interactives : SSH, console MySQL, logs et
      consommateurs.
- [ ] Vérifier la propagation des codes de retour afin qu'un échec de Castor
      échoue bien le test ou le job CI appelant.

### 6. Production et déploiement

- [ ] Confirmer qu'aucun pipeline de production, runbook opérateur ou script
      externe n'appelle Fabric.
- [ ] Si un tel appel existe, le remplacer par la commande Castor équivalente
      et valider les accès, secrets, SSH/SCP, chemins et droits.
- [ ] Vérifier que la migration ne modifie pas le runtime PHP de l'application
      déployée ni les commandes Symfony exécutées dans les conteneurs.
- [ ] Tester séparément les éventuelles tâches de déploiement avant de retirer
      Fabric de l'image ou de l'environnement concerné.

En l'absence d'appel de production trouvé dans le dépôt, l'impact attendu sur
la production applicative est nul. L'impact potentiel concerne uniquement les
outils de déploiement ou d'exploitation qui seraient maintenus en dehors du
dépôt.

### 7. Suppression et nettoyage

- [x] Supprimer les modules Python Fabric/Invoke devenus inutiles dans
      `infrastructure/deploylib/`.
- [x] Supprimer `fabfile.py`.
- [x] Supprimer les dépendances Fabric/Invoke, Pipenv et les fichiers associés
      si aucune autre utilisation Python ne subsiste.
- [ ] Supprimer les commentaires, exemples et références Fabric restants.
- [x] Mettre à jour les conventions de commande dans `AGENTS.md` et les guides
      concernés.
- [ ] Vérifier avec une recherche globale qu'il ne reste aucun appel `fab`,
      `pipenv run fab` ou import Fabric hors historique/documentation de
      migration.

## Stratégie de validation

La migration ne doit pas être considérée comme terminée parce que `castor list`
fonctionne. Il faut valider les parcours réels suivants.

### Vérifications unitaires du runner

- [x] Castor démarre avec la version attendue et découvre toutes les tâches.
- [x] Les namespaces et options sont correctement exposés.
- [x] Une commande échouée retourne un code non nul.
- [ ] Les sorties stdout/stderr sont lisibles dans un terminal et dans CircleCI.
- [ ] Les commandes interactives et les TTY nécessaires fonctionnent.
- [ ] Les arguments shell sont transmis sans régression de quoting.

### Développement local

- [ ] Démarrer et arrêter la stack Docker Compose.
- [ ] Vérifier la fusion des fichiers Compose sur macOS et Linux.
- [ ] Déployer l'application, générer la base et vider le cache.
- [ ] Exécuter une commande Symfony, Composer et SQL.
- [ ] Sauvegarder/restaurer MySQL et Elasticsearch.
- [ ] Créer les queues RabbitMQ et lancer/arrêter un consommateur.
- [ ] Compiler GraphQL, générer les schémas et vérifier l'absence de diff.

### CI

- [x] Exécuter un workflow complet sur la branche de migration.
- [x] Vérifier les jobs PHPUnit, API GraphQL et Cypress.
- [x] Vérifier les artefacts et rapports JUnit.
- [x] Vérifier les workflows parallèles et la restauration isolée des données.
- [ ] Vérifier qu'un échec Castor bloque bien les jobs dépendants.

### Tests applicatifs

- [ ] Exécuter les tests Jest E2E qui restaurent la base et Elasticsearch.
- [ ] Exécuter les tests Cypress qui utilisent les hooks de plugin.
- [ ] Exécuter au moins un test nécessitant une feature flag, RabbitMQ et une
      commande Symfony.
- [ ] Exécuter les tests de snapshots et comparer les fichiers générés.
- [ ] Exécuter les tests PHPUnit/PHPSpec lancés par les tâches QA.
- [ ] Ajouter ou adapter des tests automatisés lorsque le comportement actuel
      n'est pas couvert, en particulier pour la restauration DB/ES, les options
      de commandes et les codes de retour.

## Critères de fin

La migration est terminée lorsque :

1. les tâches nécessaires sont disponibles avec Castor en local et dans la CI ;
2. les parcours de test listés ci-dessus passent sur macOS/Linux et CircleCI ;
3. les hooks Jest/Cypress et les snapshots fonctionnent sans Fabric ;
4. les éventuels usages de déploiement ou de production ont été validés ;
5. Fabric, Invoke, Pipenv et les fichiers Python associés peuvent être
   supprimés sans appel résiduel dans le dépôt ;
6. l'ADR et les instructions de développement reflètent l'état final.

## Références

- [`ADR/001-fabric_to_castor.md`](../ADR/001-fabric_to_castor.md)
- [`ADR/001-continuous_integration.md`](../ADR/001-continuous_integration.md)
- [`ADR/001-preprod_deployment_process.md`](../ADR/001-preprod_deployment_process.md)
- [Castor - Basic usage](https://castor.jolicode.com/docs/getting-started/basic-usage/)
- [Castor - Executing processes](https://castor.jolicode.com/docs/getting-started/run/)
- [Castor - SSH and remote servers](https://castor.jolicode.com/docs/going-further/helpers/ssh/)

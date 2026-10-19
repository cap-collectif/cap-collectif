# PHPUnit — exécution et vérifications

Application de la [décision PHPUnit](../../../ADR/001-phpunit_tests.md).
Ces consignes s’appliquent aux nouveaux tests et aux tests remaniés ;
la migration historique reste progressive.

Voir l’[index des guides](../README.md) pour choisir les autres sujets utiles.

## Exécuter et vérifier la découverte

Toutes les commandes PHP s'exécutent dans le conteneur applicatif, jamais sur l'hôte :

```bash
docker exec -w /var/www capco_application_1 bin/phpunit tests/UnitTests
docker exec -w /var/www capco_application_1 bin/phpunit tests/UnitTests/CronTimeIntervalTest.php
docker exec -w /var/www capco_application_1 bin/phpunit --filter=testReturnsTheTimeRemainingUntilTheNextTrigger
docker exec -w /var/www capco_application_1 bin/phpunit --list-tests
```

Les tests d'intégration nécessitent la stack et les données techniques de
l'environnement `test`. Vérifier cet environnement avant toute écriture.
Les tests HTTP nécessitent aussi les queues RabbitMQ : la CI les crée avec
`castor ci:app:rabbitmq-queues` après la restauration des données.
Ce guide conserve les emplacements et les runners actuels.

Les logs de test, warnings et erreurs compris, sont conservés dans
`var/log/test.log` par le seul handler `main` de `config/packages/test/monolog.yaml`.
Ils ne sont pas écrits sur `stderr`, afin d'éviter
de bloquer les tests PHPUnit exécutés dans des sous-processus isolés.
Chaque exécuteur du job PHPUnit publie ce fichier compressé dans les artefacts
CircleCI, sous `phpunit/logs/test.log.gz`, même si les tests échouent. Si la
préparation échoue avant de produire un log, son absence n'ajoute pas d'échec.

[`phpunit.xml`](../../../phpunit.xml) conserve la suite locale `default` pour
`tests/` et la suite `Unit Tests` pour `tests/UnitTests/`. CircleCI répartit les
fichiers `tests/**/*Test.php` sur quatre exécuteurs selon les durées historiques
par fichier. `MigrationCommandTest.php` reste exécuté séparément dans le job
`migrations`. Un exécuteur sans sélection s'arrête avant de préparer sa stack.
Les chemins fournis au répartiteur utilisent le préfixe `/var/www/`, comme les
attributs `file` des rapports PHPUnit produits dans le conteneur.
Les rapports JUnit de chaque exécuteur sont publiés comme résultats de tests et
comme artefacts ; ils alimentent les prochaines répartitions.

Tout changement de chemin doit préserver la découverte et les rapports JUnit,
selon [l'ADR CI](../../../ADR/001-continuous_integration.md).

Pour lancer l'ensemble des tests hors migrations :

```bash
castor local:qa:phpunit --log-junit=var/phpunit/junit.xml
```

Les tâches Castor locale et CI sélectionnent la suite `default` par défaut.
`defaultTestSuite="default"` préserve aussi ce choix pour un appel direct à `bin/phpunit`.
`--testsuite` permet de sélectionner une autre suite définie dans `phpunit.xml`.
Pour cibler un fichier ou un dossier, utiliser
`--tests=tests/Authentication/FranceConnect`.
Pour reproduire une sélection de plusieurs fichiers comme en CI :

```bash
castor local:qa:phpunit --tests="tests/UnitTests/CronTimeIntervalTest.php tests/UnitTests/MenuItemUrlTest.php" --log-junit=var/phpunit/selection.xml
```

Une sélection vide est refusée. Avec plusieurs chemins, Castor génère une
configuration temporaire à côté de `phpunit.xml` : les réglages sont conservés,
mais les suites sont remplacées par la sélection explicite, qui prend le pas
sur `--testsuite`. La configuration est supprimée même en cas d'échec. Cela évite
les arguments positionnels multiples, dont PHPUnit 9 n'exécuterait que le premier.
Le filtre `--filter` reste applicable aux tests sélectionnés.

Avec `--log-junit`, le wrapper supprime l'ancien rapport et vérifie la présence du
nouveau fichier après une exécution réussie. En CI, le dossier de sortie doit être
inscriptible par l'utilisateur du conteneur applicatif, dont l'UID peut différer
de celui qui a créé le dossier dans le checkout.

Le script `bash .circleci/test-castor-phpunit.sh` vérifie ces contrats contre le vrai
runner PHP dans le conteneur, avec des fixtures temporaires sans données métier.
La CI l'exécute uniquement sur l'exécuteur PHPUnit numéro 0 après sa sélection de
tests, en réutilisant sa stack déjà préparée. La phase
`phpunit_runner_validation` en mesure le coût. Les rapports synthétiques sont
temporaires et ne sont pas publiés parmi les résultats utilisés pour le découpage.
Son répertoire temporaire `.phpunit-runner-*` est créé à la racine du checkout,
accessible à CircleCI et monté dans le conteneur, puis supprimé en sortie.
Il ne dépend pas des droits de `var/` restauré depuis le workspace.

Avant revue : lancer le test ciblé et les tests concernés, vérifier qu'une
régression du comportement le fait échouer, puis vérifier qu'il passe seul et
dans sa suite. En cas de suspicion de dépendance à l'ordre, exécuter la suite
concernée avec `--order-by=random` et conserver la seed pour reproduire l'échec.
Ne pas ajouter de test ignoré ou de capture d'exception qui masque un échec.
Les contrôles PHPStan, PHP CS Fixer et Rector avant commit restent ceux de
[AGENTS.md](../../../AGENTS.md).

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
Ce guide conserve les emplacements et les runners actuels.

[`phpunit.xml`](../../../phpunit.xml) découvre `tests/`, avec une suite dédiée à
`tests/UnitTests/`. CircleCI répartit les fichiers `tests/**/*Test.php` et traite
`MigrationCommandTest.php` séparément. Tout changement de chemin doit préserver
ces deux modes de découverte et les rapports JUnit, selon
[l'ADR CI](../../../ADR/001-continuous_integration.md).

Avant revue : lancer le test ciblé et les tests concernés, vérifier qu'une
régression du comportement le fait échouer, puis vérifier qu'il passe seul et
dans sa suite. En cas de suspicion de dépendance à l'ordre, exécuter la suite
concernée avec `--order-by=random` et conserver la seed pour reproduire l'échec.
Ne pas ajouter de test ignoré ou de capture d'exception qui masque un échec.
Les contrôles PHPStan, PHP CS Fixer et Rector avant commit restent ceux de
[AGENTS.md](../../../AGENTS.md).

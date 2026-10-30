# Scripts QA

Les hooks automatisés et CircleCI utilisent les commandes Docker/Symfony
directement. Ces scripts PHP contiennent uniquement les opérations composites
partagées avec les commandes Castor locales et tournent dans le conteneur
applicatif, depuis `/var/www`, avec les dépendances Composer installées.

```bash
docker exec -u capco -w /var/www capco_application_1 php scripts/qa/phpunit.php --tests="tests/UnitTests/CronTimeIntervalTest.php tests/UnitTests/MenuItemUrlTest.php" --log-junit=var/phpunit/selection.xml
docker exec -u capco -w /var/www capco_application_1 php scripts/qa/elasticsearch-snapshot.php save
docker exec -u capco -w /var/www capco_application_1 php scripts/qa/elasticsearch-snapshot.php restore --confirm
```

`phpunit.php` accepte `--tests`, `--filter`, `--testsuite` et `--log-junit`.
Une sélection explicite remplace les suites de `phpunit.xml` dans un fichier
temporaire supprimé après le run. Une sélection vide ou inexistante échoue.
Le code de sortie PHPUnit est propagé et le rapport JUnit demandé doit être non vide.

`elasticsearch-snapshot.php` sauvegarde ou restaure `repository_qa/snap_qa`.
`restore --confirm` remplace les index de test : préparer la référence avant
l'exécution. `--shared` utilise le dépôt transmis par le workspace CI et inclut
`analytics_test` ; la restauration valide la référence avant de supprimer les
anciens index, puis rétablit les alias `capco` et `capco_indexing`.
Les hooks ajoutent cette option lorsque `CI_SHARED_TEST_DATA=1`.

Les imports MySQL restent des commandes directes. En CI partagée, les resets
utilisent `.circleci/profile-mysql-restore.sh` (données seules) après la restauration
initiale complète effectuée par `.circleci/test-data.sh`.

Validation : `bash .circleci/test-phpunit.sh` utilise de vrais tests synthétiques,
sans données métier. Les vérifications locales Castor restent dans
`scripts/agents/test-castor-local-workflows.sh`.

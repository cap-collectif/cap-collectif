# ADR 001 - Continuous Integration

## Intégration Continue (CI)

### Contexte

Dans le projet nous utilisons actuellement CircleCI afin de jouer tous les checks et tests e2e, api, etc.

La CI du projet rencontre plusieurs problématiques :
- **Temps d'exécution élevé** : environ 1h par run en janvier 2026
- **Coûts importants** : factures CircleCI oscillant entre 900€ et 2000€/mois (objectif : 700€/mois)
- **Impact sur la DX** : ralentissement du travail des développeuses et développeurs

### Décisions et bonnes pratiques

#### 1. Arrêt automatique de la CI en cas d'échec précoce

**Décision** : Si l'un des jobs `lint-js`, `unit-js`, `unit-php` ou `typecheck-js` échoue, la CI s'arrête immédiatement.

**Raison** : Ces jobs sont rapides et détectent des erreurs fondamentales. Inutile de continuer les jobs lourds (e2e, build) si le code de base ne passe pas les vérifications essentielles qui vont de toute façon nécessiter un commit correctif, et donc une nouvelle CI.

#### 2. Découpage des tests Cypress

**Décision** : L'ancien job `e2e-cypress` est découpé en 3 jobs distincts :
- `e2e-cypress-frontoffice` : tests du front office
- `e2e-cypress-backoffice` : tests du back office
- `e2e-cypress-frontoffice-workflow` : tests du parcours "participation workflow"

**Raison** : Permet une meilleure parallélisation et un debugging plus ciblé en cas d'échec. On ne rejoue pas l'intégralité des test cypress mais "uniquement" ceux du dossier concerné.


#### 3. Parallélisme optimisé

**Décision** : Le parallélisme est configuré à divers endroits pour diminuer le temps nécessaire à certains jobs très longs lors du run initial ou de potentiel rerun (si flaky ou échec circonstanciel).

Le découpage peut toujours être optimisé selon le quota de parallélisme disponible (ne pas dépasser le parallélisme maximum sous peine de facturation supplémentaire)

**Raison** : Réduit le temps total d'exécution en exploitant le test splitting.

Le job `unit-js` utilise 5 exécuteurs. Les tests historiques de `frontend/` sont répartis par CircleCI et les tests `admin-next` utilisent le sharding natif de Jest à partir de `CIRCLE_NODE_INDEX` et `CIRCLE_NODE_TOTAL`. Toute nouvelle suite ajoutée à ce job doit également être répartie, ou être explicitement limitée à un seul exécuteur, afin de ne pas être exécutée 5 fois.

Le job `phpunit-tests` utilise 2 exécuteurs et répartit les fichiers selon leurs temps d'exécution historiques. Les résultats JUnit doivent être conservés pour alimenter cette répartition et permettre de ne relancer que les tests en échec.

Ce parallélisme doit rester volontairement limité : chaque exécuteur démarre sa propre stack Docker et restaure les données de test. Ajouter des exécuteurs réduit le temps des tests, mais duplique ce coût de restauration, consomme davantage de crédits et occupe plus de capacité de parallélisme sans gain nécessairement proportionnel.

#### 4. Données de test communes aux exécuteurs

**Décision** : Le job `prepare-test-data` réinitialise MySQL et Elasticsearch une seule fois par workflow. Il transmet par le workspace CircleCI le dump MySQL, l'instantané Elasticsearch, le pipeline d'ingestion `geoip` et les médias créés par les fixtures. Les jobs Cypress, GraphQL API et PHPUnit restaurent ces données dans leur propre stack Docker, puis reconstruisent le cache Symfony `test` pour générer les proxies Doctrine dans le conteneur. Les feature flags Redis sont réinitialisés dans chaque stack ; Cypress continue à restaurer les données avant chaque suite.

**Raison** : Éviter de rejouer les migrations, les fixtures et l'indexation dans chaque exécuteur tout en conservant leur isolation. Les données sont recréées à chaque workflow car certaines fixtures dépendent de la date. Un artefact manquant ou une restauration incomplète fait échouer le job.

Dans l'image de test, Elasticsearch utilise l'UID 1001 et partage le GID 1000 avec l'application (UID 1000) pour accéder au dépôt d'instantanés. L'image de développement conserve l'UID Elasticsearch par défaut.

Les médias des fixtures restent possédés par l'application (UID 1000) et sont accessibles en écriture au groupe de l'exécuteur CircleCI, afin que les tests GraphQL puissent créer leurs copies temporaires.

Les logs Cypress affichent `restore_db` et `restore_es` pour la durée totale de chaque tâche. Les lignes `CI_RESTORE_TIMING` détaillent l'import MySQL dans le conteneur et les appels Elasticsearch (en millisecondes). L'écart avec les durées totales comprend notamment le démarrage de Castor et les opérations de la tâche hors de ces appels. Comparer ces durées sur le sous-job le plus lent avant de modifier la restauration.

MySQL est restauré avec son schéma au démarrage de chaque exécuteur. Les resets
entre tests utilisent ensuite `var/db.restore.sql` : suppression des lignes et
réimport dans une transaction, puis restauration des compteurs `AUTO_INCREMENT`
du socle. Le schéma et les contraintes restent en place ; cette méthode suppose
que les scénarios ne modifient pas le schéma. Le test de migrations reste isolé
dans son job dédié. Les resets locaux conservent l'import complet historique.
Les deux fichiers SQL sont produits et transmis par `prepare-test-data` ; un
fichier manquant fait échouer le job sans repli silencieux sur une autre méthode.

Pour comparer les deux méthodes sur le dump local, exécuter
`docker exec -w /var/www capco_application_1 bash scripts/benchmark-mysql-restore.sh`.
Ce script utilise une base temporaire, compare les dumps après chaque restauration
et vérifie les clés étrangères, les données binaires, les tables vides et les
compteurs d'identifiants. Ses durées locales ne prédisent pas les durées CircleCI.

#### 5. Vérification de la couverture des specs Cypress

**Décision** : Un job `check-cypress-spec-coverage` s'exécute avant les jobs `e2e-*` / `api-*` (au même titre que `unit-php`, `phpunit-tests`, `lint-js`, `unit-js`, `typecheck-js`, etc.) et fait échouer la CI si un fichier de spec Cypress se trouve en dehors des dossiers `frontOffice`, `frontOfficeWorkflow` ou `backOffice` couverts par les jobs `e2e-cypress-*`.

**Raison** : Suite au découpage des tests Cypress par dossier (cf. décision #2), un spec ajouté en dehors de ces dossiers ne serait exécuté par aucun job CircleCI et échouerait silencieusement de couvrir du code. Ce job détecte ces specs orphelins tôt, avant les jobs gourmands en ressources.

Voir `.circleci/check-cypress-spec-coverage.sh`. Si un nouveau dossier de premier niveau est ajouté sous `cypress/e2e`, il faut à la fois créer un job `e2e-cypress-*` dédié et l'ajouter à la liste `KNOWN_DIRS` du script.

#### 6. Jobs non exécutés sur `master`

**Décision** : Certains jobs peuvent être désactivés sur `master` (ex: `typecheck-js`, `unit-js`, `unit-php`, `build-production-image`).

**Raison** : Si le code a été mergé via PR avec une CI verte, ces vérifications sont redondantes sur master.

### Bonnes pratiques

#### Pour les développeuses

| Pratique | Description |
|----------|-------------|
| **Annuler les CI inutiles** | Annuler manuellement une CI en cours si on n'a pas besoin du résultat (travail non terminé, nouveau push imminent) |
| **Utiliser `[skip ci]`** | Ajouter `[skip ci]` dans le titre du commit pour éviter de déclencher une CI inutile |
| **Vérifier localement avant de push** | Lancer les linters et tests en local pour éviter d'utiliser des crédits inutilement |
| **Ne pas relancer toute la CI** | Utiliser le rerun des jobs individuels plutôt que relancer tout le workflow (nécessaire d'attendre la fin du workflow avant de rerun les tests échoués) |

#### Commandes utiles avant un push

```bash
# Linting
yarn lint
yarn prettier --check .

# Tests unitaires
yarn test
bin/phpunit tests/UnitTests

# TypeScript
yarn ts  # dans admin-next/
```

#### Gestion des tests flaky

Les tests flaky (tests qui peuvent échouer et passer sur le même commit) font échouer la CI sans raison liée aux modifications du code de la PR.

- Les tests flaky sont suivis dans l'issue [#17159](https://github.com/cap-collectif/platform/issues/17159)
- En cas de test flaky identifié, le créer comme sub-issue dans l'issue dédiée
- Prioriser la correction des tests flaky les plus fréquents

### Configuration CircleCI

#### Structure des workflows

```
prepare → prepare-docker → prepare-test-data → phpunit-tests / e2e-* / api-*

prepare → lint-js / unit-js / unit-php / typecheck-js / check-cypress-spec-coverage → (si succès) → e2e-* / api-* / build-*
```

Si l'un des jobs de vérification rapide échoue, les jobs suivants ne sont pas exécutés.

#### Cache

Le cache CircleCI est limité (2GB inclus par période de facturation). Éviter de stocker des artefacts volumineux inutilement.
Afin de limiter les problèmes liés au cache et de diminuer les factures, nous avons choisi de diminuer la durée de conservation du cache.

Les clés des caches de build JavaScript et des fichiers Relay sont calculées à partir des
sources suivies par Git avant leur restauration. Les traductions téléchargées sont également
prises en compte pour les builds. La même clé est utilisée lors de la sauvegarde : calculer
la clé à partir des fichiers générés empêcherait sa réutilisation au run suivant.

`prepare` génère les fichiers Relay seulement en l'absence d'artefacts restaurés depuis le
cache, puis les transmet aux jobs de lint, de vérification TypeScript et de tests Jest par le
workspace. Ces jobs ne relancent pas le compilateur Relay.

### Statut

Validé

### Références

- [CircleCI - Automatic reruns](https://circleci.com/docs/guides/orchestrate/automatic-reruns/)
- Issue flaky tests : [#17159](https://github.com/cap-collectif/platform/issues/17159)
- PR découpage Cypress : [#18869](https://github.com/cap-collectif/platform/issues/18869)
- PR arrêt CI sur échec : [#18873](https://github.com/cap-collectif/platform/issues/18873)

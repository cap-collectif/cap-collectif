# Guides d’écriture des tests

Les ADR [PHPUnit](../../ADR/001-phpunit_tests.md) et [Jest](../../ADR/001-jest_tests.md)
expliquent les décisions et leurs compromis. Les documents ci-dessous décrivent
leur mise en œuvre. Lire les sujets utiles au scénario plutôt que recopier un
test historique sans vérifier son statut.

## PHPUnit

| Sujet | Guide |
|---|---|
| Frontière publique, intégration HTTP/CLI et emplacements | [Frontières et emplacements](phpunit/frontieres.md) |
| Fixtures, transactions, nettoyage et Elasticsearch | [Données et isolation](phpunit/donnees-isolation.md) |
| Scénarios, data providers, assertions, mocks et stubs | [Assertions et doubles](phpunit/assertions-doubles.md) |
| Commandes, découverte et vérifications avant revue | [Exécution](phpunit/execution.md) |

## Jest

| Sujet | Guide |
|---|---|
| Choix de suite, fonctions, DOM, Relay et snapshots | [Logique et composants](jest/logique-composants.md) |
| Données, globals, mocks, configuration, promesses et timers | [Données et isolation](jest/donnees-isolation.md) |
| API réelle, effets persistés et restauration MySQL/Elasticsearch | [API GraphQL](jest/api-graphql.md) |
| Runners, commandes, découverte et vérifications avant revue | [Exécution](jest/execution.md) |

## Commun

Le [guide des statuts et références](statuts-references.md) définit les catégories,
les marqueurs et les conditions pour choisir un test comme modèle.

Les principes d’isolation et de comportement observable reprennent les consignes
backend v2, adaptées aux suites et emplacements actuels du dépôt.

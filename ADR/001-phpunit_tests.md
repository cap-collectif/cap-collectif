# ADR 001 — Écriture des tests PHPUnit

## Statut

Proposé — 2 octobre 2026.

## Contexte

Les tests backend mêlent règles métier, vérifications d'implémentation et
intégration. Un test peut rester vert sans prouver le contrat HTTP ou la
persistance attendue ; à l'inverse, il peut échouer après un refactoring qui
préserve le comportement. Les données partagées rendent aussi certains scénarios
dépendants de leur ordre d'exécution.

## Décision

### Frontières et emplacements

Tester les règles métier par leur interface publique et l’intégration depuis
HTTP ou CLI pour prouver des effets réels. Conserver les emplacements actuels
évite une réorganisation sans bénéfice comportemental.
Voir le [guide des frontières](../docs/tests/phpunit/frontieres.md).

### Données et isolation

Chaque scénario reste indépendant. Autoriser un socle de fixtures restaurable
limite le coût de préparation des contextes complexes sans sacrifier l’isolation.
Voir le [guide des données et de l’isolation](../docs/tests/phpunit/donnees-isolation.md).

La migration pilote des feature flags utilise une extension PHPUnit activée
explicitement par classe : elle prépare le preset Redis avant chaque test et le
rétablit après son nettoyage, y compris en cas d’échec. Le resetter partagé avec
Jest et Cypress est appelé directement dans le processus PHPUnit, sans démarrer
Symfony ni un sous-processus PHP ; les autres tests conservent
leur isolation actuelle pendant cette adoption progressive.

### Assertions et doubles

Vérifier des résultats métier explicites et limiter les doubles aux frontières
utiles rend les tests moins sensibles aux refactorings de l’implémentation.
Voir le [guide des assertions et doubles](../docs/tests/phpunit/assertions-doubles.md).

### Exécution

Préserver la découverte et vérifier les scénarios dans leur environnement adapté
évite qu’un test valide localement échappe à la suite attendue.
Voir le [guide d’exécution](../docs/tests/phpunit/execution.md).

### Références et adoption

Adopter les conventions progressivement et sélectionner des modèles après revue
permet de guider les nouveaux tests sans présumer la conformité de l’existant.
Voir le [guide commun des statuts et références](../docs/tests/statuts-references.md).

## Alternatives envisagées

- **Vérifier les interactions internes** : préparation souvent simple, mais
  couplage à l'implémentation et preuve insuffisante des effets réels.
- **Tout tester par HTTP** : frontière réaliste, mais coût inutile pour les règles
  métier pouvant être vérifiées isolément.
- **Reconstruire toutes les données à chaque test** : isolation explicite, mais
  préparation coûteuse pour les scénarios avec de nombreuses relations ou une recherche.

## Conséquences

Les tests documentent les contrats métier et résistent mieux aux refactorings.
L'isolation réduit les dépendances à l'ordre d'exécution ; les références relues
fournissent des modèles fiables sans présumer la conformité de la suite historique.

En contrepartie, préparer et restaurer les données exige davantage de travail,
notamment lorsque plusieurs stockages participent au scénario. Certains tests
nécessitent une infrastructure d'intégration adaptée. La migration progressive
maintient la couverture utile, mais prolonge la coexistence de plusieurs approches.

## Références

- [Index des guides techniques](../docs/tests/README.md).
- [Décision sur les tests Jest](001-jest_tests.md), pour les contrats GraphQL.
- [PR #20373 — classification des tests de référence](https://github.com/cap-collectif/platform/pull/20373/changes).

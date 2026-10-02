# ADR 001 — Écriture des tests Jest

## Statut

Proposé — 2 octobre 2026.

## Contexte

Jest couvre la logique frontend, les composants et les contrats de l'API GraphQL.
Ces usages ne prouvent pas les mêmes comportements : un backend simulé ne valide
pas ses droits ou sa persistance. Les snapshots volumineux et les assertions sur
l'état interne des composants rendent les régressions difficiles à discerner et
les refactorings coûteux. Les données et doubles partagés peuvent aussi rendre
les résultats dépendants des scénarios précédents.

## Décision

### Logique et composants

Vérifier les résultats publics et le comportement visible des composants,
avec des snapshots secondaires, rend les régressions plus faciles à discerner
et limite le couplage à la structure React. Conserver les suites actuelles.
Voir le [guide de logique et des composants](../docs/tests/jest/logique-composants.md).

### Données et isolation

Maîtriser les données, doubles et opérations asynchrones de chaque scénario
réduit les dépendances à l’ordre d’exécution et les échecs intermittents.
Voir le [guide des données et de l’isolation](../docs/tests/jest/donnees-isolation.md).

### API GraphQL

Tester les contrats et effets métier contre l’API réelle évite de confondre
un comportement frontend simulé avec les droits et la persistance du backend.
Voir le [guide API GraphQL](../docs/tests/jest/api-graphql.md).

### Exécution

Conserver les runners dédiés et vérifier la découverte permet de couvrir chaque
usage dans son environnement sans masquer leurs différences.
Voir le [guide d’exécution](../docs/tests/jest/execution.md).

### Références et adoption

Adopter les conventions progressivement et choisir les modèles après revue
maintient la couverture utile pendant la migration des tests historiques.
Voir le [guide commun des statuts et références](../docs/tests/statuts-references.md).

## Alternatives envisagées

- **Snapshots seuls et inspection des composants** : écriture rapide, mais
  faible preuve des interactions et couplage à la structure React.
- **Tout tester dans un navigateur** : parcours réalistes, mais exécution plus
  coûteuse et diagnostic moins précis pour les règles locales.
- **Une suite unique pour tous les usages** : commandes uniformes, mais confusion
  entre environnement frontend simulé et contrat backend réel.

## Conséquences

Les tests sont plus lisibles et moins sensibles aux changements d'implémentation.
La séparation des suites rend explicite ce que chaque test prouve. L'isolation
et les assertions métier réduisent les régressions masquées et les échecs intermittents.

En contrepartie, les tests de composants demandent une préparation plus précise
et les tests API une restauration adaptée aux stockages utilisés. La migration
des snapshots et doubles historiques nécessite du temps ; son adoption progressive
maintient temporairement plusieurs approches et des runners distincts.

## Références

- [Index des guides techniques](../docs/tests/README.md).
- [Décision sur les tests PHPUnit](001-phpunit_tests.md) et [tests navigateur](001-frontend_tests.md).
- [PR #20373 — classification des tests de référence](https://github.com/cap-collectif/platform/pull/20373/changes).

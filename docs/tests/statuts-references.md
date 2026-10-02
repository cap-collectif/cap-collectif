# Statuts et sélection des tests de référence

Ce guide applique les décisions [PHPUnit](../../ADR/001-phpunit_tests.md)
et [Jest](../../ADR/001-jest_tests.md). Les mêmes statuts s’utilisent dans les
suites backend, frontend, admin-next et API GraphQL.

## Sens des statuts

| Statut | Sens |
|---|---|
| `reference` | Exemple canonique relu et conforme, autorisé comme modèle |
| `compliant` | Conforme, sans être un exemple canonique |
| `non-compliant` | Utile, mais contrevient à une ou plusieurs conventions |
| `legacy` | Repose sur une approche ou architecture à migrer |
| `obsolete` | Couvre un comportement abandonné ; à supprimer |

## Choisir le périmètre du marqueur

Pour PHPUnit, marquer la classe ou la méthode ; utiliser un statut de fichier
seulement si tout son contenu relève du même statut. Pour Jest, marquer le
fichier, le `describe` ou le `it`/`test` au niveau le plus précis.
Un fichier mixte conserve des statuts distincts ; un statut global ne doit pas
masquer les différences entre ses scénarios.

## Écrire le marqueur

```php
/**
 * @phpunit-status legacy
 * @phpunit-reason Calls a subscriber directly instead of exercising the HTTP boundary.
 * @phpunit-migration #1234
 */
```

```ts
/**
 * @jest-status non-compliant
 * @jest-reason Only snapshots the component tree without asserting the submitted values.
 * @jest-migration #1234
 */
```

Les commentaires sont en anglais. Expliquer la raison de chaque statut,
obligatoirement pour `non-compliant`, `legacy` et `obsolete`. Ajouter un ticket
uniquement lorsqu’il existe ; `#1234` est un exemple, pas un ticket à recopier.

## Promouvoir une référence

Seuls les tests explicitement marqués `reference` après revue servent de modèles.
Un test non marqué doit être examiné avant réutilisation ; il n’est pas déclaré
non conforme par défaut. Un test qui passe n’est pas automatiquement une référence.

La promotion requiert une revue de la frontière, de l’isolation et des assertions.
Ces marqueurs ne sont pas encore contrôlés automatiquement pour PHPUnit ou Jest
et ne remplacent pas la CI. Ce guide ne promeut aucun test historique à lui seul.

## Références

- [PR #20373 — statuts et conventions de référence](https://github.com/cap-collectif/platform/pull/20373/changes).
- [Index des guides techniques](README.md).

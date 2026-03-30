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
- `e2e-cypress-workflow` : tests du parcours "participation workflow"

**Raison** : Permet une meilleure parallélisation et un debugging plus ciblé en cas d'échec. On ne rejoue pas l'intégralité des test cypress mais "uniquement" ceux du dossier concerné.


#### 3. Parallélisme optimisé

**Décision** : Le parallélisme est configuré à divers endroits pour diminuer le temps nécessaire à certains jobs très longs lors du run initial ou de potentiel rerun (si flaky ou échec circonstanciel).

Le découpage peut toujours être optimisé selon le quota de parallélisme disponible (ne pas dépasser le parallélisme maximum sous peine de facturation supplémentaire)

**Raison** : Réduit le temps total d'exécution en exploitant le test splitting.

#### 4. Jobs non exécutés sur `master`

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
prepare → lint-js / unit-js / unit-php / typecheck-js → (si succès) → e2e-* / build-*
```

Si l'un des jobs de vérification rapide échoue, les jobs suivants ne sont pas exécutés.

#### Cache

Le cache CircleCI est limité (2GB inclus par période de facturation). Éviter de stocker des artefacts volumineux inutilement.
Afin de limiter les problèmes liés au cache et de diminuer les factures, nous avons choisi de diminuer la durée de conservation du cache.

### Statut

Validé

### Références

- [CircleCI - Automatic reruns](https://circleci.com/docs/guides/orchestrate/automatic-reruns/)
- Issue flaky tests : [#17159](https://github.com/cap-collectif/platform/issues/17159)
- PR découpage Cypress : [#18869](https://github.com/cap-collectif/platform/issues/18869)
- PR arrêt CI sur échec : [#18873](https://github.com/cap-collectif/platform/issues/18873)

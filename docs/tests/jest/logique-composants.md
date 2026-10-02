# Jest — logique, composants et snapshots

Application de la [décision Jest](../../../ADR/001-jest_tests.md).
Ces consignes s’appliquent aux nouveaux tests et aux tests remaniés ;
la migration historique reste progressive.

Voir l’[index des guides](../README.md) pour choisir les autres sujets utiles.

## Choisir la suite avant d'écrire le test

| Suite | Ce qu'elle prouve | Emplacement et découverte | Exécution |
|---|---|---|---|
| Frontend historique | Logique JS/TS et comportement local des composants | Dossier existant concerné sous `frontend/js/`, notamment `components/`, `services/` ou `redux/` ; fichiers `*-test.ts` ou `*-test.tsx` | `yarn test` à la racine ; `jsdom` |
| Admin Next | Logique JS/TS et comportement local des composants | Dossier existant concerné sous `admin-next/`, notamment `components/`, `shared/`, `utils/` ou `src/app/` ; fichiers `*-test.ts`, `*-test.tsx`, `*.test.ts` ou `*.test.tsx`, selon la convention locale | `yarn test` depuis `admin-next/` ; `jsdom` |
| API GraphQL | Contrat de l'API réelle et effets métier de ses opérations | Dossier existant concerné sous `features/graphql-api/<schema>/Query/` ou `features/graphql-api/<schema>/Mutation/`, avec les sous-dossiers par fonctionnalité déjà présents ; fichiers `.js` | `yarn test-e2e-types` ou `yarn test-e2e-mutations` à la racine ; Node |

Conserver l'organisation actuelle et placer chaque nouveau test dans le dossier
correspondant à son périmètre, en suivant la convention de nommage locale parmi
celles reconnues par le runner. Ce guide n'impose ni nouvelle arborescence, ni
déplacement des tests existants, ni uniformisation des suffixes dans `admin-next`.
Le chemin d'un test indique son périmètre ; il ne garantit pas sa conformité.

Le script racine `yarn test` ne lance ni les tests `admin-next`, ni ceux de l'API.
Pour les nouveaux contrats GraphQL, utiliser le schéma `internal`. Ne pas créer
un fichier `*.test.ts` à la racine en supposant qu'il sera découvert.

Un test de composant avec Relay simulé prouve le comportement du composant, pas
les droits ni la persistance du backend. Un test d'API ne prouve pas le parcours
dans le navigateur. Réserver les parcours navigateur, cookies réels, navigation
et interactions dépendantes du navigateur à Cypress, selon
[son ADR](../../../ADR/001-frontend_tests.md). Pour le backend PHP hors contrat GraphQL,
consulter [le guide PHPUnit](../phpunit/frontieres.md).

## Décrire un comportement observable

Nommer les `describe` et `it`/`test` en anglais avec le contexte et le résultat
attendu : `rejects a vote when the viewer is not allowed to participate`.
Préparer les données, effectuer l'action, puis vérifier ses conséquences.
Un test correspond à un scénario ; plusieurs assertions cohérentes sont permises.

- Pour une fonction : vérifier son résultat ou son erreur publique avec des
  entrées explicites, dont les limites pertinentes. Utiliser `test.each` pour
  plusieurs variantes du même contrat.
- Pour un composant : rendre le composant, effectuer l'interaction et vérifier
  le résultat visible ou le callback public convenu.
- Pour une API : vérifier les données, erreurs et effets métier accessibles ;
  ajouter un scénario de refus et l'absence d'effet interdit lorsque pertinent.
- Ne pas vérifier un état React interne, une instance de composant, un hook privé,
  une structure de fibres ou une séquence d'appels sans contrat public associé.
- Les règles importantes d'un reducer se vérifient par l'état produit. Ne pas
  tester Redux, React, Next.js ou Relay pour eux-mêmes.

Préférer `toBe` pour les scalaires, `toEqual`/`toStrictEqual` pour une structure
attendue et `toMatchObject` pour un sous-ensemble volontaire. Éviter les assertions
trop permissives qui laissent passer une régression, par exemple `toBeTruthy()`
lorsqu'un code précis est attendu. Ne pas calculer l'attendu avec la fonction testée.

## Tester les composants depuis le DOM

Pour les nouveaux tests de composants dans `admin-next`, utiliser React Testing
Library, déjà déclarée dans ce workspace. Privilégier les requêtes par rôle et nom
accessible, puis par label ou texte pertinent. Un `data-testid` est un recours
pour un élément sans représentation accessible exploitable ; une classe CSS,
un index de tableau ou la structure exacte du DOM n'est pas un contrat utilisateur.

Choisir la requête selon l'intention :

- `getByRole`/`getByLabelText` pour un élément présent immédiatement ;
- `queryByRole` pour vérifier une absence ;
- `findByRole` pour un élément qui apparaît après une opération asynchrone.

Employer `user-event` si disponible dans le workspace ; sinon utiliser les
interactions de Testing Library (`fireEvent`) en gardant un scénario utilisateur
réaliste. Ce guide n'ajoute pas `user-event` ni `jest-dom` : leurs APIs et matchers
ne doivent pas être supposés disponibles.

Enzyme et `react-test-renderer` restent utilisables pour maintenir les tests
historiques. Ils ne sont pas les modèles des nouveaux tests de comportement DOM.
Testing Library n'étant déclarée que dans `admin-next`, son adoption dans le
frontend historique nécessite une déclaration de dépendance et un setup adaptés
dans une modification dédiée ; ne pas dépendre implicitement du hoisting.

Pour Relay, créer un environnement de test par scénario, fournir les providers
nécessaires, résoudre ou rejeter explicitement l'opération avec `relay-test-utils`,
puis vérifier le chargement, le résultat ou l'erreur visible. Les variables d'une
opération ou d'un callback peuvent être vérifiées lorsqu'elles portent le contrat
métier. Ne pas inspecter le cache interne Relay ni mocker le hook qui porte le
comportement à tester. Si une query change, compiler les artefacts dans le workspace
concerné ; le Relay racine ne compile pas `admin-next`.

Les helpers actuels de [`admin-next/tests/testUtils.tsx`](../../../admin-next/tests/testUtils.tsx)
et les setups globaux sont des outils à examiner, pas des références implicites.
Certains remplacent des composants UI, le hasard ou la console : un test ne peut
pas prétendre valider une interaction supprimée par ces doubles. Les composants
serveur asynchrones et contrats HTTP Next.js qui dépassent `jsdom` se vérifient
depuis une frontière d'intégration adaptée, plutôt qu'en inspectant un objet React
ou en assimilant une exception simulée à une réponse HTTP réelle.

## Garder les snapshots petits et secondaires

Les assertions explicites sur les résultats métier sont prioritaires. Un snapshot
peut compléter un contrat stable et limité, mais un arbre React entier ou une
réponse contenant beaucoup de champs non pertinents rend les changements difficiles
à examiner. Un snapshot qui ne change pas ne prouve pas qu'une interaction fonctionne.

Fixer les valeurs variables ou utiliser des matchers ciblés pour les champs dont
la valeur exacte est hors contrat. Ne pas supprimer les champs importants pour
stabiliser artificiellement un snapshot. Mettre à jour uniquement les snapshots
concernés par un changement voulu, examiner leur diff et les versionner avec le
test. Une mise à jour globale avec `-u` n'est pas une correction de test.

## Exemple d'un test de logique

Exemple adapté à `frontend/js/services/GeoJsonValidator-test.ts`, utilisant
l'API publique existante. Le booléen attendu est explicite et le test ne dépend
pas de la structure interne du validateur.

```ts
import { isValid } from './GeoJsonValidator'

describe('GeoJsonValidator', () => {
  test.each([
    { name: 'numeric coordinates', coordinates: [102, 0.5], expected: true },
    { name: 'a non-numeric latitude', coordinates: [102, 'invalid'], expected: false },
  ])('validates a point with $name', ({ coordinates, expected }) => {
    const feature = {
      type: 'Feature',
      geometry: { type: 'Point', coordinates },
    }

    const result = isValid(feature)

    expect(result).toBe(expected)
  })
})
```

Cet exemple n'attribue pas de statut au fichier historique.

## Références

- [Testing Library — requêtes et priorité accessible](https://testing-library.com/docs/queries/about/).
- [Jest 29.7 — snapshots](https://jestjs.io/docs/29.7/snapshot-testing).
- [Relay 18 — test des composants](https://relay.dev/docs/v18.0.0/guides/testing-relay-components/).

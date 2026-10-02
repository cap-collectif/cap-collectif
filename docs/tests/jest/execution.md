# Jest — exécution et vérifications

Application de la [décision Jest](../../../ADR/001-jest_tests.md).
Ces consignes s’appliquent aux nouveaux tests et aux tests remaniés ;
la migration historique reste progressive.

Voir l’[index des guides](../README.md) pour choisir les autres sujets utiles.

## Exécuter et relire

Utiliser le Node compatible avec `package.json` et activer Corepack avant la
première commande Yarn dans l'environnement. Depuis la racine :

```bash
corepack enable
yarn test --runTestsByPath frontend/js/services/GeoJsonValidator-test.ts
yarn test --listTests
yarn workspace admin-next test --runTestsByPath shared/login/LoginForm-test.tsx
yarn workspace admin-next test --listTests
yarn test-e2e-types --runTestsByPath features/graphql-api/internal/Query/Query_appVersion.js
```

Adapter les chemins au fichier effectivement concerné.
Pour une mutation, utiliser `yarn test-e2e-mutations --runTestsByPath <fichier>`.
Les suites API nécessitent la stack locale de test et leur socle de données.

Avant revue, vérifier :

- Le test est découvert par le bon runner et couvre une régression identifiable.
- Il passe seul et avec les tests concernés, sans `.only`, `.skip` ni promesse oubliée.
- Les scénarios de refus et les limites utiles sont couverts ; les mocks et ressources
  sont restaurés même en cas d'échec.
- Les snapshots éventuels ont été relus, et les artefacts Relay concernés régénérés.
- La découverte CI est préservée. `admin-next` utilise le sharding Jest ; le partage
  CircleCI historique cible actuellement `frontend/**/*-test.tsx`, alors que le
  runner local reconnaît aussi `*-test.ts`. Lors d'un changement de cette répartition,
  vérifier la couverture des fichiers et éviter une exécution répétée des tests `.ts`
  sur plusieurs exécuteurs.

La couverture est un indicateur de zones à examiner, pas un objectif de pourcentage
qui justifierait des tests de détails internes. Appliquer les contrôles de lint et
de types du workspace concerné ; l'exécution Jest ne remplace pas TypeScript.

## Références

- [Configuration frontend](../../../jest.config.js), [admin-next](../../../admin-next/jest.config.js),
  [API Query](../../../jest.config.e2e.queries.js) et [API Mutation](../../../jest.config.e2e.mutations.js).

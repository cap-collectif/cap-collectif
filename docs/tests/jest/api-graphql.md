# Jest — contrats de l’API GraphQL

Application de la [décision Jest](../../../ADR/001-jest_tests.md).
Ces consignes s’appliquent aux nouveaux tests et aux tests remaniés ;
la migration historique reste progressive.

Voir l’[index des guides](../README.md) pour choisir les autres sujets utiles.

## Tester l'API GraphQL réelle avec des données isolées ou restaurées

Les tests API passent par `/graphql/internal` pour le nouveau développement.
Utiliser les helpers existants de [`jest-setup.e2e.js`](../../../jest-setup.e2e.js), après
avoir vérifié leurs limites, et expliciter l'identité du demandeur. Ne pas appeler
directement un resolver PHP.

- Vérifier les données utiles et les erreurs GraphQL ou `errorCode` du payload.
  Un HTTP 200 ne signifie pas à lui seul que l'opération métier a réussi.
- Vérifier un effet de mutation par une nouvelle lecture API, ou une lecture en
  base ciblée si l'effet n'est pas exposé. Ne pas mocker l'API dans cette suite.

### Préparer un socle et les données du scénario

Les fixtures peuvent fournir le contexte métier commun, notamment les utilisateurs,
projets et contributions déjà indexées. Décrire les fixtures utilisées et créer
seulement les données spécifiques manquantes, de préférence par les APIs publiques
ou par un helper de préparation explicite. Ne pas modifier les fixtures utilisées
simultanément par d'autres tests.

Les opérations testées dans les fichiers `Query` restent en lecture seule. Si leur
préparation écrit en base ou dans un index, elle nécessite la même isolation qu'une
mutation ; le nom `Query` ne garantit pas l'absence de modifications.

### Restaurer tous les stockages concernés

Les helpers actuels fournissent une stratégie de restauration avant chaque test :

- Importer explicitement [`_setupDB`](../../../features/graphql-api/_setupDB.js) dans les
  fichiers dont les scénarios ou la préparation écrivent en base. Le helper restaure
  MySQL avant chaque test ; la configuration des mutations ne le fait pas à elle seule.
- Importer [`_setupES`](../../../features/graphql-api/_setupES.js) pour les scénarios qui
  utilisent des champs indexés ou modifient Elasticsearch. Il restaure le snapshot
  Elasticsearch avant chaque test. Lorsque les données existent dans les deux
  stockages, coordonner cette restauration avec celle de MySQL pour retrouver un
  socle cohérent avant la préparation du scénario.
- Pour un fichier dont tous les scénarios laissent les index ES des fixtures
  inchangés, [`_setupESOnce`](../../../features/graphql-api/_setupESOnce.js) restaure
  le snapshot une seule fois dans `beforeAll`. Cette restauration à l'entrée du
  fichier protège contre l'état laissé par une spec précédente. Vérifier les
  effets de la préparation et des requêtes avant de choisir ce helper ; une
  mutation ou une écriture dans ces index nécessite une isolation par scénario.

### Feature flags Redis

Les runners API Query et Mutation rétablissent automatiquement le preset `test`
avant et après chaque test via `jest-setup.e2e.js`, y compris lors d'un échec
ou d'une nouvelle tentative Jest. Le reset utilise la tâche Castor
`local:qa:reset-feature-flags` (ou `ci:qa:reset-feature-flags`), qui valide les
overrides puis prépare tous les flags en une écriture Redis atomique, sans
démarrer Symfony.

Déclarer les écarts au preset dans le test ou dans un `beforeEach` de sa suite :

```js
await global.resetFeatureFlags({ registration: true, user_type: false })
```

Chaque appel remplace la configuration précédente par le preset et les overrides
fournis : regrouper les flags nécessaires dans le même objet. Ne pas les préparer
dans `beforeAll`, car le reset avant le test les effacerait. Le nettoyage final
est partagé ; il ne dépend pas d'une instruction placée après les assertions.
Les tests de composants frontend continuent à utiliser leurs mocks.

`node scripts/agents/test-jest-feature-flags.cjs` vérifie ces hooks avec le vrai runner
Jest et l'API locale, dont un échec volontaire et une nouvelle tentative. La stack
de test doit être démarrée et aucune autre suite ne doit utiliser ses flags.

### Autres ressources

Une restauration avant le prochain test peut assurer son isolation, mais elle ne
nettoie pas immédiatement les effets du dernier test exécuté. Prévoir un nettoyage
final ou une restauration du socle lorsque ces effets peuvent affecter une autre
suite ou l'exécution suivante. Une autre stratégie par nettoyage ciblé est possible
si elle garantit le même niveau d'isolation ; ne pas cumuler des restaurations
complètes et des nettoyages coûteux sans nécessité.

MySQL et Elasticsearch ne couvrent pas toutes les ressources : les flags retrouvent
le preset décrit ci-dessus ; restaurer les autres configurations modifiées,
réinitialiser l'authentification et traiter les caches, fichiers et messages lorsque
le scénario les modifie. Utiliser des
identifiants et chemins uniques pour les ressources propres au test. Leur nettoyage
doit être attendu et fonctionner même en cas d'échec.

Les requêtes HTTP écrivent depuis le processus backend : une transaction ouverte
par un outil de préparation ne garantit pas le rollback de leurs effets. Une
restauration SQL n'annule pas non plus les modifications d'Elasticsearch.

### Maîtriser la visibilité Elasticsearch

Pour les données ajoutées à un scénario de recherche, les helpers doivent assurer
la cohérence MySQL/Elasticsearch et la visibilité des documents avant les assertions.
Centraliser l'indexation et le refresh ou l'attente de visibilité dans ces helpers,
sans pause arbitraire ni réindexation complète lorsque des opérations ciblées suffisent.
La restauration d'un snapshot n'indexe pas les entités créées ensuite.

Distinguer les deux intentions :

- **Tester une recherche** : préparer les documents nécessaires avec l'indexeur
  applicatif est acceptable ; cette préparation ne constitue pas le comportement testé.
- **Tester l'indexation déclenchée par une mutation** : effectuer la mutation HTTP,
  laisser le mécanisme applicatif produire l'indexation et traiter les messages
  nécessaires de manière contrôlée, puis vérifier l'effet par une recherche.
  Ne pas indexer manuellement après la mutation pour faire passer l'assertion.

Ne pas lancer `test.concurrent` contre la base et la session partagées ; les scripts
API utilisent `--runInBand`. Cette option sérialise un processus Jest, pas plusieurs
commandes lancées simultanément. Chaque exécution parallèle doit disposer de ses
propres stockages et de son contexte d'authentification ; ne pas restaurer un socle
pendant qu'une autre exécution l'utilise.

Le setup global local sauvegarde le socle MySQL/Elasticsearch ; en CI, le socle
peut provenir des données préparées par le workflow. Aucun de ces mécanismes ne
garantit à lui seul l'isolation de chaque test. Les helpers historiques qui
invoquaient Fabric doivent utiliser les tâches Castor correspondantes
(`castor local:*` ou `castor ci:*`), selon [AGENTS.md](../../../AGENTS.md).

Le choix du runner et les commandes sont décrits dans le [guide d’exécution](execution.md).
La restauration des globals et doubles est décrite dans le [guide d’isolation](donnees-isolation.md).

## Références

- [Elasticsearch — visibilité après refresh](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/refresh-parameter).

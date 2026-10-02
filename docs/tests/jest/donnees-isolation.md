# Jest — données, isolation et asynchronisme

Application de la [décision Jest](../../../ADR/001-jest_tests.md).
Ces consignes s’appliquent aux nouveaux tests et aux tests remaniés ;
la migration historique reste progressive.

Voir l’[index des guides](../README.md) pour choisir les autres sujets utiles.

## Maîtriser les données et isoler chaque scénario

Chaque test maîtrise ses préconditions et reste indépendant des autres tests.
Il doit pouvoir être exécuté seul, rejoué et lancé dans un ordre différent.
Un parcours qui dépend de plusieurs actions successives tient dans un seul test ;
un test ne consomme jamais le résultat ou les données produits par un autre.

Adapter la préparation au type de suite :

- **Tests de logique et de composants** : créer les objets mutables, le store Redux
  et l'environnement Relay nécessaires au scénario. Des fixtures de valeurs et des
  builders peuvent être partagés, mais chaque test reçoit des instances indépendantes,
  y compris pour les objets imbriqués qu'il modifie. Ces tests ne nécessitent pas
  de fixtures MySQL ou Elasticsearch.
- **Tests API** : réutiliser un socle de fixtures stable et restaurable, puis créer
  les données manquantes propres au scénario. Il n'est pas nécessaire de reconstruire
  un projet et toutes ses relations à chaque test. Les modifications d'une fixture
  sont autorisées si son état initial est connu et restauré de façon fiable avant
  qu'un autre test puisse l'utiliser. Voir le [guide API GraphQL](api-graphql.md)
  pour les stockages réels.

Les préconditions métier restent visibles : identité, rôle, propriétaire, flags,
dates et statut. Les noms de variables et helpers doivent expliquer les fixtures
utilisées ; un identifiant opaque ne suffit pas à décrire le scénario. Éviter les
assertions sur le nombre global de fixtures, sauf si ce jeu complet constitue
explicitement le contrat testé.

Centraliser la mécanique répétitive dans des helpers : providers, construction
des données, préparation du socle et nettoyage. Leurs paramètres doivent rendre
explicites les différences entre scénarios et les ressources créées.
`beforeEach`/`afterEach` servent surtout à cette infrastructure et aux valeurs par
défaut communes. Un `afterEach` ou un `try/finally` doit libérer les ressources
propres au test même si une assertion échoue ; attendre les nettoyages asynchrones.

Pour les suites frontend, nettoyer DOM, cookies, stockage local, abonnements,
timers et globals modifiés. Testing Library assure le nettoyage DOM dans son
intégration Jest standard ; un rendu manuel exige son propre démontage. Ce
nettoyage DOM ne réinitialise pas les autres ressources.

### Restaurer les mocks et la configuration

Comprendre les APIs Jest plutôt que de les appeler toutes systématiquement :

| API | Effet |
|---|---|
| `jest.clearAllMocks()` | Efface l'historique des appels ; conserve les implémentations |
| `jest.resetAllMocks()` | Efface aussi les implémentations des mocks ; les défauts nécessaires doivent être redéfinis |
| `jest.restoreAllMocks()` | Restaure les spies créés par `spyOn` et les propriétés remplacées avec `replaceProperty` ; ne répare pas les affectations directes ni tous les mocks de module |

Les configurations des deux suites frontend activent `clearMocks: true`, mais
cela ne réinitialise pas les implémentations, flags, timers ou globals. Préférer
un spy local restauré après le test à une affectation directe ; restaurer
explicitement toute valeur initiale remplacée autrement.

Ne pas ajouter de suppression globale de `console.error` ou `console.warn` pour
faire passer un test. Pour une erreur attendue, limiter le spy au scénario,
vérifier le message pertinent et le restaurer. Les suppressions déjà présentes
dans les setups sont une limite historique, pas une convention à étendre.

## Contrôler l'asynchronisme et les dépendances externes

Toujours attendre ou retourner une promesse. Utiliser `await expect(...).rejects`
pour un rejet ; ne pas mélanger `done` et un test `async`. Une promesse lancée
sans attente peut laisser passer le test avant son assertion.

Attendre un résultat avec `findBy*` ou `waitFor`, sans pause arbitraire.
`waitFor` peut exécuter son callback plusieurs fois : placer les interactions
avant ce callback et n'y mettre que des assertions. Résoudre Relay et faire
avancer les timers sous `act` lorsque cela provoque une mise à jour React.

Pour un debounce ou un délai métier, utiliser les fake timers, avancer la durée
pertinente, puis revenir aux timers réels dans le nettoyage. Contrôler l'heure,
le fuseau et le hasard lorsque nécessaire. Fixer l'horloge Node ne fixe pas
l'horloge du backend PHP d'un test d'API.

Ne pas augmenter le timeout ni ajouter un retry pour masquer une attente incorrecte.
Les timeouts des suites API peuvent rester plus élevés pour l'infrastructure.
Les appels réseau réels sont réservés aux tests d'API ; les tests unitaires et
de composants remplacent les services externes à leur frontière. Ne pas mocker
le code testé ni toute sa chaîne de dépendances par commodité.

## Références

- [Jest 29.7 — asynchronisme](https://jestjs.io/docs/29.7/asynchronous).
- [Jest 29.7 — mocks, restauration et timers](https://jestjs.io/docs/29.7/jest-object).

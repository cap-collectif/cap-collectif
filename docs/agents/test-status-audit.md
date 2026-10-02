# Marquage initial des tests PHPUnit et Jest

Analyse du 2 octobre 2026, selon les [conventions PHPUnit](../../ADR/001-phpunit_tests.md)
et [Jest](../../ADR/001-jest_tests.md).

## Périmètre et méthode

L'analyse couvre les 117 fichiers `tests/**/*Test.php` et les 1 057 fichiers
Jest des suites frontend, `admin-next` et API GraphQL : respectivement 548, 77
et 432 fichiers. Les helpers et configurations ont été consultés pour comprendre
la découverte, les doubles et la restauration des données ; ils ne reçoivent pas
le statut des tests qui les utilisent.

Cette première classification repose sur une analyse statique : inventaire des
déclarations, recherche des frontières et assertions, examen des helpers de
préparation/nettoyage, des cas mixtes et des références retenues. Les marqueurs
documentent les écarts observés ; ils ne constituent ni une certification de
l'ensemble des parcours, ni un résultat de CI. Les tests non conformes restent
utiles et continuent à s'exécuter.

Les marqueurs sont placés sur une classe, un `describe` ou un test selon le
périmètre du constat. Une classe ou suite mixte conserve des statuts distincts.
Chaque statut porte une raison en anglais. Aucun ticket de migration n'est
inventé et aucun test n'est déclaré `obsolete` sans preuve d'un comportement
abandonné.

## Répartition des déclarations de tests

Les [définitions des statuts et références](../tests/statuts-references.md) sont
communes aux deux outils ; l’[index des guides](../tests/README.md) donne accès
aux consignes détaillées par sujet.

| Statut | PHPUnit | Jest, dont API |
|---|---:|---:|
| `reference` | 11 | 8 |
| `compliant` | 64 | 311 |
| `non-compliant` | 237 | 1 487 |
| `legacy` | 35 | 1 264 |
| `obsolete` | 0 | 0 |
| Total | 347 | 3 070 |

Ces nombres comptent les méthodes et déclarations `it`/`test`, avec héritage du
statut de leur classe ou suite. Les variantes d'un data provider ou de `test.each`
ne sont pas comptées séparément. Le nombre de commentaires est donc différent.

## Références retenues

| Suite | Fichier | Ce qu'il illustre |
|---|---|---|
| PHPUnit | [HttpRedirectUrlNormalizerTest](../../tests/HttpRedirect/HttpRedirectUrlNormalizerTest.php) | Logique publique, requêtes réelles et restauration de la configuration |
| PHPUnit | [ValidCustomCodeContentValidatorTest](../../tests/Validator/ValidCustomCodeContentValidatorTest.php) | Validation de documents avec variantes nommées |
| PHPUnit | [FeatureToggleCommandTest](../../tests/Command/FeatureToggleCommandTest.php) | Contrat CLI, idempotence, refus et restauration du flag |
| Jest frontend | [csvToArray-test.ts](../../frontend/js/utils/csvToArray-test.ts) | Entrées locales et résultats explicites |
| Jest admin-next | [request-locale.test.ts](../../admin-next/src/app/server/request-locale.test.ts) | Priorité header/cookie et locale de repli |
| Jest admin-next | [proposalStepObjectType.test.ts](../../admin-next/shared/constants/proposalStepObjectType.test.ts) | Cas positifs et négatifs paramétrés d'une règle publique |

Aucun test de composant DOM ni de mutation GraphQL n'est promu en référence dans
ce premier marquage. Les tests API en lecture qui vérifient explicitement leurs
données ou refus peuvent être `compliant` sans devenir des exemples canoniques.

## Écarts à traiter lors des prochaines modifications

- **Frontières PHPUnit** : appels directs de contrôleurs ou subscribers,
  vérification de repositories, mutations avec persistance simulée et réflexion
  sur des méthodes privées. Les processors Swarrot relèvent de l'architecture
  historique à migrer.
- **Assertions** : détails internes de Doctrine, séquences d'appels sans contrat
  public, résultats déduits d'un autre composant, snapshots seuls ou vérifications
  trop faibles pour le comportement annoncé. Un test de pagination qui vérifie
  seulement la longueur peut laisser passer deux pages identiques.
- **Composants Jest** : Enzyme et `react-test-renderer` restent des outils de
  maintenance historique. Un helper de logique publique dans le même fichier ne
  reçoit pas automatiquement leur statut `legacy`.
- **Isolation** : fixtures mutables partagées, environnement ou globals non
  restaurés, exports vers des chemins communs et nettoyages après les assertions
  plutôt que dans un `finally` ou un teardown. Restaurer MySQL ne restaure pas
  les flags Redis, Elasticsearch ou les fichiers.
- **API GraphQL** : les snapshots ne remplacent pas des assertions métier. Le
  helper `_setupDB` restaure avant chaque test, mais ne fournit pas de restauration
  finale des mutations. Les changements de flags nécessitent également une
  restauration fiable, même si le test échoue.

Une raison décrit un écart identifié, pas nécessairement tous les écarts du test.
Avant de promouvoir un test, revoir son ensemble : frontière, assertions,
asynchronisme et stockages concernés. Le socle `DatabaseCommandTestCase`
neutralise Elasticsearch ; la conformité d'un scénario limité aux effets SQL
ne prouve pas l'indexation applicative.

## Vérifications

- Les six fichiers de référence ont passé leurs tests ciblés : 24 cas PHPUnit
  et 17 cas Jest, en comptant les variantes paramétrées.
- Les 1 057 fichiers Jest ont été reparsés et leurs AST exécutables comparés
  avant/après : identiques hors commentaires et positions.
- Les 117 fichiers PHPUnit ont été parsés dans le conteneur PHP 8.1 et leurs
  tokens exécutables comparés avant/après : identiques hors commentaires et espaces.
- Les annotations PHPUnit existantes, notamment les data providers, sont conservées.
- Les suites complètes et l'API GraphQL réelle n'ont pas été relancées pour ce
  changement de commentaires. Ni les scénarios, ni les snapshots, ni les
  configurations de test ne sont modifiés.

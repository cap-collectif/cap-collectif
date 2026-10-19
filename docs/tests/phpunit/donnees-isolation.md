# PHPUnit — données et isolation

Application de la [décision PHPUnit](../../../ADR/001-phpunit_tests.md).
Ces consignes s’appliquent aux nouveaux tests et aux tests remaniés ;
la migration historique reste progressive.

Voir l’[index des guides](../README.md) pour choisir les autres sujets utiles.

## Maîtriser les données et isoler chaque scénario

Chaque test maîtrise ses préconditions et reste indépendant des autres tests.
Il peut s'appuyer sur un socle de fixtures stable et restaurable : il n'est pas
nécessaire de reconstruire toute la plateforme pour chaque scénario. Les données
spécifiques au scénario et les modifications apportées aux stockages doivent être
isolées ou restaurées de manière fiable.

### Choisir les données nécessaires

- **Tests unitaires** : créer les objets nécessaires au scénario, sans kernel,
  base ni Elasticsearch. Des builders peuvent éviter une préparation répétitive.
- **Tests d'intégration** : réutiliser les fixtures pertinentes pour le contexte
  commun, puis créer les données manquantes propres au scénario. Éviter de recréer
  un projet et toutes ses relations lorsqu'un socle adapté existe déjà.
- **Modification d'une fixture** : autorisée si son état initial est connu et
  restauré de façon fiable avant qu'un autre test puisse l'utiliser. Ne pas modifier
  une fixture partagée avec des tests exécutés simultanément.

Rendre explicites les préconditions importantes : rôle, propriétaire, dates,
statut et relations métier. Lorsqu'une fixture est utilisée, expliquer ce qu'elle
représente par un nom de variable ou un helper métier ; un identifiant comme
`user190` ne doit pas être la seule description du scénario. Ne pas faire dépendre
une assertion d'un nombre global de fixtures, sauf si ce jeu complet constitue
explicitement le contrat testé.

Aucun test ne consomme les données produites par un autre. Ne pas utiliser
`@depends` pour construire un parcours métier ; un parcours cohérent tient dans
un seul test. Le test doit pouvoir être exécuté seul, rejoué et lancé dans un
ordre différent.

### Centraliser la préparation et le nettoyage

Les préconditions et les actions propres au scénario restent lisibles dans le
test. Centraliser la mécanique répétitive dans des builders ou helpers : création
des relations, persistance, indexation, attente de visibilité et nettoyage. Un
helper doit rendre explicites les ressources qu'il crée et leur mode de nettoyage,
sans cacher des préconditions métier importantes.

`setUp()` et `tearDown()` servent principalement à l'infrastructure commune :
kernel, connexion, transaction, restauration du socle et répertoire temporaire.
Les ressources propres au scénario peuvent être nettoyées par un `try/finally`
ou par un mécanisme commun qui les enregistre et les libère après chaque test.
Dans les deux cas, le nettoyage doit fonctionner même si une assertion échoue.

Choisir une stratégie adaptée aux stockages réellement utilisés :

- Une transaction avec rollback convient si toutes les écritures SQL passent par
  cette connexion et qu'aucun commit ne la termine. Elle ne couvre ni les écritures
  d'un autre processus ni Elasticsearch, Redis, les fichiers ou les messages.
- Pour les ressources créées par le scénario, utiliser des identifiants ou chemins
  uniques et nettoyer uniquement celles que le test possède.
- Une restauration du socle peut remplacer un nettoyage ciblé lorsqu'il est trop
  complexe, à condition de restaurer tous les stockages concernés dans un environnement
  réservé à cette exécution. Ne pas réinitialiser un stockage utilisé simultanément
  par d'autres tests.
- Utiliser le preset et les overrides décrits plus bas pour les feature flags des
  tests d’intégration Symfony. Dans les tests unitaires, simuler les flags sans Redis.
  Restaurer aussi les autres configurations modifiées. Les caches et les messages en attente
  doivent également être traités lorsqu'ils peuvent affecter le scénario suivant.

La restauration CI d'un jeu initial par exécuteur ne remplace pas l'isolation
entre les tests de cet exécuteur.

### Préparer et nettoyer les données Elasticsearch

Un test qui utilise la recherche doit disposer de données cohérentes entre MySQL
et Elasticsearch. Créer une entité en base ne suffit pas à la rendre recherchable,
et un rollback SQL ne supprime pas le document indexé.

Pour les données ajoutées au scénario, le helper de préparation doit persister
les entités, indexer les documents nécessaires, envoyer les opérations en attente
et assurer leur visibilité avant les assertions de recherche. Utiliser un refresh
contrôlé ou une attente de visibilité adaptée à l'API utilisée, sans `sleep()`
arbitraire. Dans le dépôt, `Indexer::finishBulk()` envoie les opérations et déclenche
un refresh lorsque son paramètre `isCli` vaut `false`.

Le nettoyage doit supprimer les documents créés ou rétablir les documents modifiés,
en cohérence avec la restauration SQL, puis rendre ce nettoyage visible aux recherches
suivantes. Si un snapshot sert de socle, sa restauration doit être coordonnée avec
celle des données MySQL correspondantes. Une réindexation complète par test n'est
pas nécessaire lorsqu'une préparation et un nettoyage ciblés suffisent.

Distinguer l'intention du test :

- **Tester une recherche** : préparer directement les documents avec l'indexeur
  du projet est acceptable ; cette préparation n'est pas le comportement testé.
- **Tester l'indexation provoquée par une action** : déclencher l'action depuis
  HTTP ou CLI, laisser le mécanisme applicatif produire l'indexation et traiter
  les messages nécessaires de manière contrôlée. Ne pas indexer manuellement
  après l'action pour faire passer l'assertion : cela masquerait une régression.

Le socle `DatabaseCommandTestCase` actuel fournit une transaction, mais neutralise
l'indexation Elasticsearch. Il peut convenir à un test limité aux effets SQL ;
il ne permet pas de prouver un effet sur la recherche ou le fonctionnement de
l'indexation applicative.

## Références

- [Elasticsearch — visibilité après refresh](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/refresh-parameter).

## Feature flags Redis

Tous les tests Symfony dérivés de `KernelTestCase` ou `WebTestCase` utilisent le
preset `EnvironmentPresets::TEST`, comme Jest et Cypress. L’extension déclarée
dans `phpunit.xml` prépare automatiquement ce preset avant `setUp()` et le rétablit après
`tearDown()`, y compris après une assertion échouée, une exception dans la
préparation ou le nettoyage, ou un test ignoré. Elle fonctionne aussi avec
`@runTestsInSeparateProcesses`. Les tests unitaires classiques dérivés de
`PHPUnit\Framework\TestCase` ne déclenchent aucun reset Redis, sauf opt-in
explicite via `FeatureFlagsAwareTest`.

```php
use Capco\Tests\FeatureFlags\FeatureFlagsAwareTest;
use Capco\Tests\FeatureFlags\FeatureFlagsTrait;
use Symfony\Bundle\FrameworkBundle\Test\KernelTestCase;

class ExampleTest extends KernelTestCase implements FeatureFlagsAwareTest
{
    use FeatureFlagsTrait;

    public static function featureFlagOverrides(): array
    {
        return ['calendar' => false];
    }
}
```

Pour déclarer des préconditions communes, implémenter `FeatureFlagsAwareTest`,
utiliser `FeatureFlagsTrait` et définir `featureFlagOverrides()`. Une classe
fille peut compléter celles de son parent avec `array_replace(parent::featureFlagOverrides(), [...])`.
Pour modifier des flags pendant un scénario, utiliser
`$this->setFeatureFlags(['shield_mode' => true])` : les appels successifs conservent
les overrides explicites précédents et ceux de la classe. Ces changements sont
oubliés à chaque nouvelle exécution du test. Le helper invalide aussi le cache
`Manager::isActive()` du kernel déjà démarré via `Manager::resetCache()` : une
lecture après changement utilise donc les nouvelles valeurs, même avec le même
manager ou un navigateur dont le reboot est désactivé. Préparer des flags avant
le boot reste possible et ne démarre pas le kernel.

La préparation appelle directement `Capco\Tests\FeatureFlags\FeatureFlagsResetter`
dans le processus PHPUnit, sans lancer de sous-processus ni démarrer Symfony.
Le script CLI `features/graphql-api/feature-flags-resetter.php` utilisé par Jest
et Cypress appelle la même classe. Le helper valide tous les overrides
avant une écriture Redis atomique limitée au namespace `testfeature_toggle`.
Ces préconditions n’émettent pas les événements métier des commandes Symfony ;
un test de ces commandes continue à appeler la commande réellement testée.
Ce reset ne remplace pas le nettoyage SQL, Elasticsearch ou des autres clés Redis.

Les socles `IdentityWebTestCase`, `AccountWebTestCase` et `DatabaseCommandTestCase`
centralisent les préconditions communes. Leurs helpers historiques `setFeature()`
délèguent au même reset Redis ; les scénarios ne capturent plus puis restaurent
manuellement les anciens états de flags. Les commandes Symfony de feature flags
restent appelées lorsqu’elles sont elles-mêmes le comportement testé.

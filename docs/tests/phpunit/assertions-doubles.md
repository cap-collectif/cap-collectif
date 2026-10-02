# PHPUnit — scénarios, assertions et doubles

Application de la [décision PHPUnit](../../../ADR/001-phpunit_tests.md).
Ces consignes s’appliquent aux nouveaux tests et aux tests remaniés ;
la migration historique reste progressive.

Voir l’[index des guides](../README.md) pour choisir les autres sujets utiles.

## Écrire des scénarios lisibles et discriminants

Nommer le fichier `<Comportement>Test.php`, la classe avec le suffixe `Test` et
les méthodes `test<ComportementAttendu>()`, en anglais. Organiser chaque test
en préparation, action et vérification, sans imposer trois commentaires redondants.

Un test couvre un scénario et peut contenir plusieurs assertions cohérentes.
Couvrir le cas nominal, les limites pertinentes et les refus susceptibles de
causer une régression : droits, entrée invalide, ressource absente, opération
interdite ou absence d'effet sur une ressource voisine.

Préférer `assertSame()` pour les valeurs scalaires et tableaux de contrat. Pour
une réponse JSON, décoder avec `JSON_THROW_ON_ERROR`, puis vérifier les champs
utiles ; ne pas coupler le test à l'ordre des clés ou aux espaces. Pour une erreur,
vérifier son type/code et l'absence des effets interdits, pas seulement son existence.

Utiliser des data providers nommés lorsque seule l'entrée et le résultat changent.
Ils contiennent des données, sans kernel, base, réseau ou objets partagés mutables.
Ne pas recalculer le résultat attendu avec l'algorithme testé.

Respecter les annotations compatibles PHPUnit 9, notamment `@dataProvider`.
Ne pas importer les attributs PHPUnit des versions récentes sans migration de
l'outillage.

## Quand utiliser des mocks et des stubs

Utiliser les objets métier réels. Un stub fournit une réponse maîtrisée à une
dépendance externe ; un mock vérifie une interaction seulement lorsque cette
interaction constitue le contrat observable, par exemple l'envoi d'une notification.

Ne pas mocker l'objet testé, l'ensemble du graphe de services ou une base dans un
test censé prouver une persistance. Ne pas imposer le nombre ou l'ordre des appels
internes à Doctrine. En intégration, remplacer un service tiers indisponible par un
double à sa frontière, en précisant que le test ne valide pas ce service tiers.

Fixer les dates et contrôler horloge, fuseau, hasard et réponses externes quand le
scénario en dépend. Ne pas utiliser de `sleep()` pour attendre un effet asynchrone :
traiter les messages de manière contrôlée ou attendre un résultat observable avec
une borne explicite. N'ajouter un mécanisme d'injection en production que s'il est
nécessaire à la conception, pas uniquement pour satisfaire un mock.

## Exemple d'un test unitaire

Cet exemple utilise une classe présente dans le dépôt. Le traducteur est un stub
qui rend visible la durée calculée ; le test n'impose ni séquence ni nombre d'appels.
Ce bloc illustre les conventions, sans désigner le test historique comme référence.

```php
<?php

namespace Capco\Tests\UnitTests;

use Capco\AppBundle\Command\Service\CronTimeInterval;
use PHPUnit\Framework\TestCase;
use Symfony\Contracts\Translation\TranslatorInterface;

/**
 * @internal
 */
final class CronTimeIntervalTest extends TestCase
{
    public function testReturnsTheTimeRemainingUntilTheNextTrigger(): void
    {
        $translator = $this->createStub(TranslatorInterface::class);
        $translator->method('trans')->willReturnCallback(
            static fn (string $id, array $parameters = []): string =>
                $parameters['remainingMinutes'] . ' minutes'
        );
        $interval = new CronTimeInterval($translator);

        $remaining = $interval->getRemainingCronExecutionTime(
            5,
            '2026-10-02 14:30:00'
        );

        self::assertSame('35 minutes', $remaining);
    }
}
```

## Références

- [PHPUnit 9.6 — écriture des tests et data providers](https://docs.phpunit.de/en/9.6/writing-tests-for-phpunit.html).
- [PHPUnit 9.6 — doubles de test](https://docs.phpunit.de/en/9.6/test-doubles.html).

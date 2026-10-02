# PHPUnit — frontières et emplacements

Application de la [décision PHPUnit](../../../ADR/001-phpunit_tests.md).
Ces consignes s’appliquent aux nouveaux tests et aux tests remaniés ;
la migration historique reste progressive.

Voir l’[index des guides](../README.md) pour choisir les autres sujets utiles.

## Choisir une frontière selon le comportement à protéger

Un test décrit une règle du projet et vérifie ses conséquences. Il doit continuer
à passer après un refactoring qui conserve ce comportement. « Boîte noire »
n'interdit pas d'appeler une méthode publique de logique métier ; cela interdit
de vérifier son algorithme interne.

| Catégorie | Frontière et assertions | Emplacement |
|---|---|---|
| Logique projet | API publique d'un objet métier ; valeur retournée, exception métier, état public pertinent ; sans kernel ni base | `tests/UnitTests/` ou le dossier thématique existant concerné, comme `tests/Service/`, `tests/Helper/` ou `tests/Validator/` |
| Intégration HTTP/API | Requête HTTP avec le client Symfony ; statut, corps, cookies et effets métier persistés | Dossier existant concerné sous `tests/`, notamment `tests/Controller/Api/` ou `tests/PublicApi/` |
| Intégration CLI | Commande exécutée par son interface publique ; code de sortie, messages, fichiers et effets métier persistés | `tests/Command/` |

Conserver l'organisation actuelle de `tests/` et placer chaque nouveau test dans
le dossier existant correspondant à son périmètre. Ce guide n'impose ni nouvelle
arborescence ni déplacement des tests existants. Le dossier décrit le périmètre
du test ; son nom ne garantit ni son niveau d'intégration ni sa conformité.
Un test situé dans `tests/Controller/Api/` doit ainsi exercer une requête HTTP,
plutôt qu'appeler directement une méthode du contrôleur.

Pour une commande, utiliser l'application Symfony et `CommandTester`, avec ses
arguments et options publics. Vérifier le code de sortie, les messages utiles,
les fichiers produits et les effets persistés. Si le comportement dépend des
événements console, utiliser `ApplicationTester` ou une exécution CLI réelle :
`CommandTester` ne déclenche pas ces événements. Avec `ApplicationTester`, désactiver
l'auto-exit de l'application pour que le processus de test continue.

Pour un contrat GraphQL HTTP, utiliser de préférence la suite API Jest existante
décrite dans le [guide API GraphQL](../jest/api-graphql.md). Ne pas dupliquer le même scénario
dans les deux outils sans risque distinct à couvrir.

## Tester le projet, depuis son interface publique

- Ne pas appeler directement les contrôleurs, subscribers ou repositories Doctrine
  pour tester leur fonctionnement. Un subscriber se teste par la requête HTTP ou
  la commande CLI qui provoque son effet.
- Ne pas tester le câblage Symfony, les métadonnées Doctrine, les getters/setters
  triviaux ou le comportement du framework. Tester une règle métier portée par
  une entité reste pertinent.
- Ne pas utiliser la réflexion pour lire un état privé ou invoquer une méthode
  privée/protégée. Si une règle n'est observable qu'ainsi, revoir la frontière du test.
- Le conteneur et Doctrine peuvent préparer les données et lire les résultats en
  intégration. Leur état interne ne constitue pas une assertion métier.
- Pour lire un effet en base, recharger les données après l'action, au besoin après
  `EntityManager::clear()`. Une entité restée en mémoire ne prouve pas la persistance.

Exemple : l'anonymisation d'un compte se vérifie par l'effacement des données
identifiantes, la conservation du contenu associé et l'absence de modification
d'un compte non éligible, selon les termes de [CONTEXT.md](../../../CONTEXT.md).
Vérifier qu'un repository a reçu `save()` ne suffit pas.

## Références

- [Symfony 5.x — test des commandes et événements console](https://symfony.com/doc/5.x/console.html#testing-commands).

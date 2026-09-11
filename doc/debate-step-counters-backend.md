# Compteurs de l'étape débat

## Objectif du document

Ce document décrit l'état actuel et les règles métier backend des compteurs de l'étape débat dans le cadre de la refonte de la page projet / page étape.

Il sert de référence pour :

- comprendre quels compteurs sont exposés sur `DebateStep` ;
- documenter leurs règles de calcul ;
- expliciter les différences avec certains comportements historiques ;
- garder une trace des contraintes de branchement frontend.

Référence métier associée :

- [Règles métiers des compteurs](https://www.notion.so/R-gles-m-tiers-des-compteurs-350db1231e07805f8f65ec6953727fb8)

## Point clé à garder en tête

Pour comprendre le code et les règles métier de l'étape débat, il faut partir de cette contrainte fonctionnelle :

- si un utilisateur publie un argument, alors c'est forcément qu'il a voté ;
- autrement dit, on ne peut pas argumenter sans avoir voté ;
- en revanche, on peut voter sans argumenter.

Conséquence directe :

- le vote est suffisant pour compter comme `participant` ;
- l'argument n'a pas besoin d'ajouter un participant supplémentaire.

## État actuel

### 1. Champs exposés sur `DebateStep`

Le type GraphQL :

- [src/Capco/AppBundle/Resources/config/graphql/internal/Debate/objects/InternalDebateStep.types.yml](src/Capco/AppBundle/Resources/config/graphql/internal/Debate/objects/InternalDebateStep.types.yml:1)

expose maintenant directement les trois compteurs attendus pour une étape débat :

- `contributors`
- `contributions`
- `votes`

Ces trois champs sont exposés au niveau `DebateStep` et retournent chacun un objet :

- `AggregatedResult { totalCount }`

La forme backend cible est donc bien :

- `contributors { totalCount }`
- `contributions { totalCount }`
- `votes { totalCount }`

### 2. Résolveurs utilisés

Les champs `DebateStep` utilisent les resolvers suivants :

- [src/Capco/AppBundle/GraphQL/Resolver/Debate/DebateStepContributorsResolver.php](src/Capco/AppBundle/GraphQL/Resolver/Debate/DebateStepContributorsResolver.php:1)
- [src/Capco/AppBundle/GraphQL/Resolver/Debate/DebateStepContributionsResolver.php](src/Capco/AppBundle/GraphQL/Resolver/Debate/DebateStepContributionsResolver.php:1)
- [src/Capco/AppBundle/GraphQL/Resolver/Debate/DebateStepVotesResolver.php](src/Capco/AppBundle/GraphQL/Resolver/Debate/DebateStepVotesResolver.php:1)

### 3. Particularité du champ `contributors`

Le nom `contributors` existe déjà ailleurs dans la codebase avec un sens historique plus large.

Pour l'étape débat, on l'utilise maintenant comme nom backend du compteur qui alimente le libellé métier `participants` dans le front.

En pratique, pour l'étape débat :

- le champ backend est `contributors` ;
- le libellé métier affiché côté front reste `participants`.

## Règles métier finales

## Compteurs d'une étape de débat

### Compteur de votes

Lorsqu'un utilisateur connecté ou sans compte vote, le compteur de votes s'incrémente.

Lorsqu'un utilisateur connecté ou sans compte clique sur l'icône `applause` sur un argument, le compteur de votes s'incrémente aussi.

Chaque `applause` compte pour un vote, même si plusieurs `applause` proviennent du même utilisateur.

Traduction backend actuelle :

- votes d'utilisateurs confirmés sur le débat ;
- plus votes anonymes sur le débat ;
- plus votes publiés sur les arguments du débat ;
- plus votes publiés sur les arguments anonymes du débat ;
- uniquement votes publiés.

### Compteur de contributions

Lorsqu'un argument est ajouté par un utilisateur connecté ou sans compte, le compteur de contributions s'incrémente.

Lorsqu'il y a une validation par email lors de la publication d'un argument, il faut que l'utilisateur valide manuellement la publication de l'argument dans l'email envoyé pour qu'il soit pris en compte et incrémente le compteur.

Traduction backend actuelle :

- arguments d'utilisateurs confirmés publiés et non trashed ;
- plus arguments anonymes publiés et non trashed.

### Compteur de participants

Lorsqu'un utilisateur connecté ou sans compte vote, le compteur de participants s'incrémente, indépendamment du fait que celui-ci ajoute un argument ou non.

Traduction backend actuelle :

- utilisateurs confirmés distincts ayant voté sur le débat ;
- plus participants anonymes distincts ayant voté sur le débat ;
- les `applause` n'ajoutent pas de participant.

Autrement dit :

- le vote sur l'étape est une condition suffisante pour être compté comme participant ;
- la publication d'un argument n'ajoute pas de participant supplémentaire ;
- les `applause` restent exclus du compteur participants.

## Détail des calculs backend

### `contributors { totalCount }`

Resolver :

- [DebateStepContributorsResolver.php](src/Capco/AppBundle/GraphQL/Resolver/Debate/DebateStepContributorsResolver.php:1)

Règle :

- `UserRepository::countDebateVoters($debate)`
- `+ DebateAnonymousVoteRepository::countDistinctTokensByDebate($debate)`

Conséquences :

- un utilisateur confirmé est compté via son vote sur le débat ;
- un participant anonyme est compté une seule fois par token de vote ;
- un argument publié n'incrémente pas le compteur contributors ;
- les `applause` n'incrémentent pas le compteur contributors.

### `contributions { totalCount }`

Resolver :

- [DebateStepContributionsResolver.php](src/Capco/AppBundle/GraphQL/Resolver/Debate/DebateStepContributionsResolver.php:1)

Règle :

- `DebateArgumentRepository::countByDebate($debate, ['isPublished' => true, 'isTrashed' => false])`
- `+ DebateAnonymousArgumentRepository::countPublishedByDebate($debate)`

Conséquences :

- seuls les arguments publiés sont comptés ;
- un argument anonyme en attente de validation email n'incrémente pas encore le compteur ;
- les arguments trashed ne sont pas comptés.

### `votes { totalCount }`

Resolver :

- [DebateStepVotesResolver.php](src/Capco/AppBundle/GraphQL/Resolver/Debate/DebateStepVotesResolver.php:1)

Règle :

- `DebateVoteRepository::countByDebate($debate, ['isPublished' => true])`
- `+ DebateAnonymousVoteRepository::countByDebate($debate)`
- `+ DebateArgumentVoteRepository::countByDebate($debate)`
- `+ DebateAnonymousArgumentVoteRepository::countByDebate($debate)`

Conséquences :

- on compte les votes du débat lui-même ;
- on compte aussi les `applause` sur les arguments du débat ;
- chaque `applause` incrémente le compteur, y compris si plusieurs `applause` viennent du même utilisateur ;
- les votes anonymes sont inclus.

## Mise en perspective avec les champs historiques sur `Debate`

Le type GraphQL :

- [src/Capco/AppBundle/Resources/config/graphql/internal/Debate/objects/InternalDebate.types.yaml](src/Capco/AppBundle/Resources/config/graphql/internal/Debate/objects/InternalDebate.types.yaml:1)

expose historiquement :

- `arguments`
- `votes`

Ces champs restent utiles comme référence historique, mais pour la refonte le point d'entrée à privilégier est désormais :

- `DebateStep.contributors`
- `DebateStep.contributions`
- `DebateStep.votes`

autrement dit les compteurs directement portés par la step.

## Mise en perspective avec l'export simplifié participants débat

L'export simplifié participants débat historique ne suit pas exactement la règle métier finale retenue pour le compteur backend `contributors`.

Historique export simplifié :

- utilisateurs confirmés distincts ayant voté ou argumenté sur le débat ;
- plus arguments anonymes.

Règle métier actuelle du compteur participants :

- utilisateurs confirmés distincts ayant voté ;
- plus votes anonymes ;
- l'argument ne compte pas comme participant supplémentaire ;
- les `applause` ne comptent pas comme participants.

Conclusion :

- l'export simplifié participants reste une référence historique utile ;
- mais il n'est plus la source de vérité fonctionnelle du compteur participants affiché pour l'étape débat.

## Contrainte frontend / Relay

Les champs backend sont bien exposés sous leurs noms backend :

- `contributors`
- `contributions`
- `votes`

En revanche, dans un fragment Relay partagé sur `Step`, ces champs peuvent entrer en conflit avec d'autres types d'étapes qui utilisent les mêmes noms avec des types de retour différents.

Exemple :

- `ConsultationStep.contributions` retourne une connexion ;
- `DebateStep.contributions` retourne un `AggregatedResult`.

Conséquence :

- côté frontend, il peut être nécessaire d'utiliser des alias Relay locaux dans les fragments partagés ;
- cette contrainte ne remet pas en cause le contrat backend exposé sur `DebateStep`.

Dans l'état actuel, le backend expose bien :

- `contributors`
- `contributions`
- `votes`

et le frontend peut les requêter avec des alias locaux dans un fragment partagé, par exemple :

```graphql
... on DebateStep {
  contributors {
    totalCount
  }
  debateContributions: contributions {
    totalCount
  }
  debateVotes: votes {
    totalCount
  }
}
```

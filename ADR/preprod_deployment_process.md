# Mise en place d'une branche `preprod`

## Historique

Avant d'avoir une branche `preprod` et une branche `master` distinctes
la branche `master` avait à la fois pour rôle d'être la branche de référence pour déployer le code sur les instances clients
et à la fois le rôle de déployer ce même code sur l'instance de `preprod`.

Le code sur `master` était testé par le/la QA sur l'instance preprod.

Cette architecture posait 2 problèmes concrets :

- du code non testé pouvait se retrouver en production à cause d'un bug bloquant nécessitant une mise en
  production rapidement.
- un bouchon pouvait se créer naturellement sur la preprod étant donné que l'on pouvait merger dans `master`
dès qu'une fonctionnalité était validée, bloquant ainsi les déploiements.

## Mise en place d'une branche preprod

La branche `preprod` a vocation à répondre à cette problématique en distinguant bien les rôles de la branche `preprod` de ceux de la branche `master`.

La branche `preprod` a pour rôle d'être une branche de test / validation avant la mise en production.

La branche `master` a pour rôle de contenir du code testé prêt à être déployé par l'équipe Assistance.

La branche de référence du projet devient `preprod`.

Toutes les nouvelles branches doivent être tirées de `preprod` et toutes les PRs doivent pointer vers `preprod`.

### Cycle de vie d'une PR

#### Dans le cas d'une nouvelle feature / tâche technique  

```mermaid
flowchart TD
  A["Branche preprod"] -->|Créer une nouvelle branche| B["Créer une PR pointant vers preprod"]
  B --> n1["Demande de review"]
  B --> n2["Demande de recette"]
  n2 --> n3["Recette validée : ajout du tag Validated test"]
  n1 --> n4["Review approved"]
  n4 --> n5["Recette validée + PR approved : ajout du tag go to preprod"]
  n3 --> n5
  n5 --> n6["Le/la QA se charge de merger dans la branche preprod à son rythme"]
  n6 --> n7["Merge du code de preprod dans master une fois testé par le/la QA ou l'assistance grâce à une GitHub Action"]
  n7 --> n8["L'assistance se charge de déployer le code sur les instances clients"]
  n7 --> n9["Déclenchement du webhook Trigger CI master pipeline pour lancer la CI sur master"]
```

Dans le cas d'une tâche technique ne nécessitant pas de recette et ayant été approuvée, nous pouvons directement appliquer le label "go to preprod" à la PR si la ci passe.

#### Dans le cas d'un bug bloquant

Les bugs bloquants ont besoin d'être déployés rapidement de par leur nature.

Pour éviter qu'ils n'aient à se retrouver bloqués dans les tests de la branche `preprod`, le process change :

```mermaid
flowchart TD
  A["Branche master"] -->|Créer une nouvelle branche| B["Créer une PR pointant vers master"]
  B --> n1["Demande de review"]
  B --> n2["Demande de recette"]
  n2 --> n3["Recette validée : ajout du tag Validated test"]
  n1 --> n4["Review approved"]
  n4 --> n5["Le dev se charge de merger dans master"]
  n3 --> n5
  n5 --> n6["Le code est prêt à être déployé par l'équipe Assistance"]
  n5 --> n7["Cherry-pick du commit mergé dans master pour rapatrier le code dans preprod"]
  n5 --> n8["Déclenchement du webhook Trigger CI master pipeline pour lancer la CI sur master"]
```

### Résolutions :

Ce nouveau process permet :

- de s'assurer que le code déployé sur les instances clients est du code testé
- d'éviter de bloquer des déploiements à cause de code non testé sur `preprod`
- de pouvoir merger et déployer des bugs bloquants sans avoir à embarquer du code non testé
- de permettre à la QA d'étaler plus facilement le code à tester sur `preprod` à son rythme, plutôt que d'empiler du nouveau code chaque jour
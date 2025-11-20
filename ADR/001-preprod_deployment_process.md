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
  A["Branche preprod"] -->|"Créer une nouvelle branche"| B["Créer une PR pointant vers preprod"]
  B --> n1["Demande de review"]
  B --> n2["Demande de recette"]
  n2 --> n3["Recette validée : ajout du tag 'Validated test'"]
  n1 --> n4["Review approved"]
  n4 --> n5["Recette validée + PR approved : ajout du tag 'go to preprod'"]
  n3 --> n5
  n5 --> n6["Le/la QA se charge de merger dans la branche preprod à son rythme"]
  n6 --> n7["Merge du code de preprod dans master une fois testé par le/la QA ou l'assistance grâce à une GitHub Action"]
  n7 --> n8["L'assistance se charge de déployer le code sur les instances clients"]
  n7 --> n9["Déclenchement du webhook 'Trigger CI master pipeline' pour lancer la CI sur master"]
  n7 --> n10["Déploiement automatique sur les instances Conception et demo2"]
```

Dans le cas d'une tâche technique ne nécessitant pas de recette et ayant été approuvée, nous pouvons directement merger la PR dans preprod si la ci passe.

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
  n5 --> n7["Rebase de preprod sur master pour rapatrier les changements"]
  n5 --> n8["Déclenchement du webhook Trigger CI master pipeline pour lancer la CI sur master"]
  n5 --> n9["Déploiement automatique sur les instances Conception et demo2"]
```

Commandes à lancer pour rappatrier le code de master sur preprod et conserver un historique linéaire sur preprod :

```
git branch -D master && git fetch origin master && git checkout master
git branch -D preprod && git fetch origin preprod && git checkout preprod
git rebase master
git push --force-with-lease
```

Seules certaines personnes peuvent forcer le push sur preprod. Cette liste peut être étendue au cas par cas.

### Comment déployer ?

- Aller sur les PRs ayant le label [Go to preprod](https://github.com/cap-collectif/platform/pulls?q=is%3Aopen+is%3Apr+label%3A%22Go+to+preprod%22)
- Merger la PR ayant le label en cliquant sur le bouton "Squash and merge"

![Squash and merge PR](./assets/squash_and_merge_pr.png)

- une fois mergé, aller sur la branche preprod et vérifier qu'une ci tourne bien sur la branche

![Check pr ci](./assets/check_pr_ci.png)

- une fois la recette validée, il faut activer le github action pour merger le code de preprod dans master en allant dans l'onglet `Actions`

![Actions tab](./assets/actions_tab.png)

- Cliquer sur `Merge preprod branch into master` dans le menu à gauche de la page puis cliquer sur `Run workflow` à droite de la page et `Run workflow`.

La branche sélectionnée doit être `preprod` (branche par défaut).

Si le job est vert alors le merge a fonctionné. Dans le cas contraire une intervention manuelle est nécessaire pour débugger le soucis.

![execute github actions](./assets/execute_github_action.png)

### Résolutions :

Ce nouveau process permet :

- de s'assurer que le code déployé sur les instances clients est du code testé
- d'éviter de bloquer des déploiements à cause de code non testé sur `preprod`
- de pouvoir merger et déployer des bugs bloquants sans avoir à embarquer du code non testé
- de permettre à la QA d'étaler plus facilement le code à tester sur `preprod` à son rythme, plutôt que d'empiler du nouveau code chaque jour
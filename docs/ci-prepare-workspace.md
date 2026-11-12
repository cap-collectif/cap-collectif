# Workspace de préparation CircleCI

Le job `prepare` partage les dépendances et les fichiers générés nécessaires aux
contrôles, aux préparations de tests et aux images QA/production. Son workspace
est distinct des caches CircleCI réutilisés entre pipelines et des artefacts
publiés pour consultation.

## Consommateurs

| Artefacts | Consommateurs et rôle |
| --- | --- |
| `frontend/js/__generated__`, `admin-next/__generated__` | TypeScript, ESLint, Jest et compilation Admin Next de test. |
| `src/Capco/AppBundle/GraphQL/__generated__` | Autoload PHP, commandes Symfony et tests. |
| `vendor`, `bin` | Dépendances et exécutables Composer des contrôles et des stacks de test. |
| `admin-next/node_modules` | Contrôles Admin Next, build partagé et serveur Cypress. Les dépendances racine et Cypress utilisent leurs caches existants. |
| `translations` | Frontends, commandes Symfony, contrôle CSV et images. |
| Assets sous `public`, `public/bundles`, workers MapLibre | Requêtes HTTP des tests et construction des images. |
| `admin-next/.next/standalone`, `admin-next/.next/static`, workers sous `admin-next/public/maplibre` | Le Dockerfile distant copie ces sorties dans les images QA/production. Le serveur utilise le bundle standalone. |
| `admin-next/.next/types` | Types produits par Next.js, conservés avec les autres fichiers générés. |

`prepare-admin-next` remplace le build de production par un build `test`, puis
publie sa propre archive, sans bundle standalone ni cache du compilateur.
`prepare-test-data` construit et publie les dumps MySQL, l’instantané Elasticsearch,
le pipeline `geoip`, les médias et le cache Symfony `test` créé sous `/var/www`.
Ces deux publications restent indépendantes du contenu de `prepare`.

La mesure de référence trouve 69,28 Mio sous `var/cache/test`, mais aucun cache
`dev`. `graphql-doctor` utilise `dev` et ne bénéficie donc pas de ce cache initial.
Le cache `test` utile aux machines est reconstruit sous `/var/www` par
`prepare-test-data`. `prepare` ne persiste plus `var`, ses logs ni ses fichiers
temporaires ; la restauration partagée crée son répertoire parent si nécessaire.
Elle crée aussi le log `test.log` vide avec l’utilisateur applicatif avant les
commandes de test exécutées en `root`, pour préserver l’écriture par PHP-FPM.

Le cache Webpack de Next.js représente 1 138,31 Mio sur les 1 777 Mio du workspace
initial. Il reste sauvegardé dans les caches de build, mais n’est plus transmis
aux consommateurs par le workspace. Les sorties `standalone`, `static` et `types`
totalisent 104,70 Mio. Le serveur compilé est déjà inclus dans `standalone`.

`prepare-docker` construit uniquement les images de services à partir des
contextes suivis par Git sous `infrastructure/services`. Il ne lance pas la stack
et ne consomme aucun fichier du workspace applicatif : il ne l’attache plus.
Sa dépendance à `prepare`
conserve néanmoins la couche de ce dernier dans les ancêtres des jobs de test.

## Protocole de comparaison

La campagne de l’issue [#20779](https://github.com/cap-collectif/platform/issues/20779)
compare les profils `full`, `build-prod` et `qa` à sources applicatives identiques.
Les différences de caches et de traductions sont identifiées. Chaque mesure
utilise un nouveau pipeline ; les relances héritent du workspace précédent.

Pendant la campagne, le rapport `workspace-metrics/prepare.json` fournit les
tailles apparentes des chemins déclarés et le détail de `var` et `.next`.
Les logs natifs de publication
et restauration donnent les tailles compressées réellement transférées et les
durées complètes. Les tailles affichées en Mio par CircleCI sont arrondies.

Après la campagne, l’instrumentation et ses tests sont retirés de l’exécution
automatique de `prepare`. Ils restent disponibles à la demande dans
[`scripts/agents/`](../scripts/agents/README.md), avec leurs commandes et
prérequis. Les mesures ci-dessous décrivent les exécutions instrumentées du
10 novembre ; elles ne sont pas recalculées à chaque pipeline.

Le coût est évalué par workflow, en comptant tous les exécuteurs parallèles,
les préparations, les éventuelles reconstructions et l’instrumentation.
Les crédits de calcul observés sont distingués des estimations de stockage.
Une réduction du volume seule ne démontre pas une accélération ni une économie
de crédits. Une régression confirmée sur un workflow n’est pas compensée par les
gains d’un autre.

La campagne commence par une paire avant/après par workflow. Les comparaisons
ambiguës ou suggérant une régression sont répétées. La recette des images utilise
les workflows existants jusqu’au démarrage réel sur la QA du ticket.

## Campagne du 10 novembre 2026

La référence `ae8a239c647177575b3f229d8f4d31b5d0375e08` contient seulement
l’instrumentation ; `8be2d0a9bd0f5ccee65c863b82745ad77da4c780` applique
l’allègement et initialise le log de test local. Les six préparations retenues
restaurent les mêmes caches frontend et Admin Next, issus du job `1756630`, et
signalent des cache hits pour les deux builds.
Les chemins conservés ont les mêmes tailles. Les premières tentatives, dont
l’instrumentation échouait sur la limite d’alias YAML, sont exclues des mesures.

| Profil | Référence | Version allégée |
| --- | --- | --- |
| `full` (`test-and-build`) | [Workflow avant](https://app.circleci.com/workflow/e3aa9d10-3486-41bf-a578-6e232b568bb4) | [Workflow après](https://app.circleci.com/workflow/217f2c5f-18bb-4157-b7bd-47c16917b218) |
| `build-prod` | [Workflow avant](https://app.circleci.com/workflow/9399c942-559f-4529-8aa4-a8b586c930dd) | [Workflow après](https://app.circleci.com/workflow/5ba72497-d7a4-4ed2-8c97-0716bdea0424) |
| `qa` | [Workflow avant](https://app.circleci.com/workflow/122dd0d1-b709-43c4-af13-2b9d054daa4a) | [Workflow après](https://app.circleci.com/workflow/045eb24b-dd1f-43a6-b54e-09540ef5ebca) |

### Volume et publication de `prepare`

Les trois profils donnent les mêmes tailles : **1 863 307 078 → 553 286 036
octets apparents**, soit **1 776,99 → 527,65 Mio (−70,31 %)**. L’archive publiée
passe de **297 à 116 Mio (−60,94 %)** dans les logs CircleCI. La suppression du
chemin absent `nodes_modules` corrige la déclaration, sans contribuer au gain.

| Profil | Publication avant | Publication après |
| --- | ---: | ---: |
| `full` | 60,119 s | 18,958 s |
| `build-prod` | 56,979 s | 19,478 s |
| `qa` | 54,014 s | 18,133 s |

La durée du job `prepare` entier baisse également, avec les mêmes caches de build :

| Profil | Job `prepare` avant → après | Évolution de durée | Crédits de `prepare` avant → après |
| --- | ---: | ---: | ---: |
| `full` | 3 min 19 s → 2 min 22 s | −28,64 % | 66 → 47 |
| `build-prod` | 3 min 32 s → 2 min 19 s | −34,43 % | 70 → 46 |
| `qa` | 2 min 51 s → 2 min 13 s | −22,22 % | 57 → 44 |

Dans `full`, la publication explique environ 41 des 57 secondes gagnées sur
`prepare`. Les autres phases du job varient aussi entre les exécutions. Le gain
du workflow complet reste plus faible en proportion, car les tests occupent la
majeure partie de sa durée et leurs machines travaillent en parallèle.

La génération des schémas de `graphql-doctor` prend 11,836 puis 9,410 secondes ;
sa restauration de workspace passe de 14,039 à 7,007 secondes. Le cache `test`
retiré n’accélère pas sa génération en `dev`. `prepare-docker` réussit sans
restauration, supprimant également ses 10,668 secondes de transfert initiales.

### Restauration chez les consommateurs

| Profil | Restaurations avant → après | Téléchargements avant → après | Durées cumulées avant → après |
| --- | ---: | ---: | ---: |
| `full` | 43 → 42 | 13 968 → 6 069 Mio | 730,086 → 285,773 s |
| `build-prod` | 1 → 1 | 297 → 116 Mio | 11,099 → 4,310 s |
| `qa` | 1 → 1 | 297 → 116 Mio | 11,004 → 4,294 s |

Le total `full` inclut les exécuteurs parallèles ainsi que les couches de données
et de build de test publiées en aval. Les durées sont additionnées entre machines
et ne représentent pas la durée murale du workflow. Les téléchargements baissent
de **7 899 Mio (−56,55 %)** et les durées cumulées de restauration de **444,313
secondes (−60,86 %)** dans ce profil.

À rétention identique, chaque publication de la couche `prepare` stocke environ
181 Mio compressés de moins. Cette baisse de stockage est distincte des crédits
de calcul mesurés ; aucun montant monétaire n’est déduit des octets transférés.

### Durée et crédits des workflows

Les valeurs proviennent de CircleCI Insights pour les workflows liés ci-dessus.
Elles incluent tous les jobs, les exécuteurs parallèles et l’instrumentation.
Les crédits sont lus après consolidation et vérifiés par la somme des jobs : les
premières réponses d’Insights peuvent encore omettre le coût des jobs terminés.

| Profil | Durée avant → après | Crédits avant → après | Évolution des crédits |
| --- | ---: | ---: | ---: |
| `full` | 22 min 26 s → 21 min 18 s | 2 999 → 2 634 | −12,17 % |
| `build-prod` | 10 min 49 s → 9 min 28 s | 143 → 118 | −17,48 % |
| `qa` | 9 min 52 s → 9 min 43 s | 127 → 119 | −6,30 % |

Les trois workflows réussissent, avec une baisse du volume, de la durée et des
crédits dans cette comparaison. Ces mesures utilisent des caches de build chauds
et ne garantissent pas les mêmes gains sur chaque exécution. En particulier,
l’écart de neuf secondes du dernier workflow QA reste faible.

Les workflows d’image avaient aussi réussi avant la correction du log, avec les
mêmes sorties de production : [QA en 9 min 02 s et 111 crédits](https://app.circleci.com/workflow/b43af5d6-36b1-4496-a65d-6ea057baad7d)
et [production en 10 min 05 s et 126 crédits](https://app.circleci.com/workflow/2c9a1373-d658-487d-be11-c3a911793340).
Cette variation des durées globales ne remet pas en cause la baisse mesurée des
publications et restaurations du workspace.

### Correction révélée par la campagne

La [première exécution optimisée de `full`](https://app.circleci.com/workflow/09a73724-8e57-4cd7-bcd2-481e910d4546)
échoue sur l’exécuteur 0 des mutations GraphQL : les 148 tests échouent,
principalement lors de la connexion HTTP avec
`Bad request` ; des requêtes anonymes renvoient aussi une erreur Symfony 500.
Les cinq autres exécuteurs du même job, les requêtes GraphQL, PHPUnit et les six
suites Cypress réussissent. Ses 20 min 44 s et 2 823 crédits ne sont donc pas
utilisés comme mesure d’un workflow réussi.
Les restaurations de données et du cache partagé y avaient toutes réussi.
Un [pipeline neuf sur le même commit](https://app.circleci.com/workflow/71ef36de-1f99-42b0-8643-1469195da540)
reproduit l’échec sur le même groupe de tests. Le premier scénario exécute une
commande SQL Symfony en `root`. Sans le log précédemment transmis par `prepare`,
Monolog crée alors un fichier que l’utilisateur HTTP `capco` ne peut pas ouvrir
en écriture. Un test isolé sous Linux reproduit le refus avec le vrai handler
Monolog et les deux utilisateurs. Il passe après l’initialisation du log vide
par `capco` dans la restauration du runtime. Cette correction évite de transmettre
les logs dans le workspace. Sur la version corrigée, les 148 tests et les 86
snapshots du groupe initialement en échec passent dans la CI réelle. Ces deux
exécutions de diagnostic sont exclues du comparatif des workflows réussis.

### Vérification de l’image déployée

Sur [qa-20779](https://qa-20779.qa.cap-collectif.com/), le pod devient `Ready`
avec zéro redémarrage et l’image
`20779-reduce-prepare-workspace.8be2d0a9bd0f5ccee65c863b82745ad77da4c780.2026-11-10.155636`.
Les deux profils d’image ciblent cette QA ; le second déploiement remplace le
premier. Les vérifications portent sur cette dernière image, après son démarrage.

Les requêtes HTTP vérifient `/projects` (200), `/admin-next/invite` (302 vers `/`),
le manifeste et un chunk sous `/_next/static/` (200), ainsi que le worker MapLibre
(200). Le build Next.js conserve l’identifiant `czSx5_kAO7_lrDsxJYsRG` provenant
du cache de production partagé. Ces vérifications de démarrage complètent les
tests du workflow `full` ; elles ne constituent pas une recette fonctionnelle
authentifiée de l’administration.

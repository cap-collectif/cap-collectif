# Investigating CircleCI failures

Use the installed CircleCI CLI first when a user provides a pipeline or job URL.
The CLI may already be authenticated even when the browser is not. Commands vary
between CLI versions: inspect local help before assuming a subcommand exists.

```bash
command -v circleci
circleci help
circleci auth me
circleci workflow get <workflow-id> --json
circleci job get <job-id> --json
circleci job output get <job-id> --step-num <step-number> --execution <index>
```

Use the UUID in the URL's `workflowId` or `job` parameter. A pipeline number or
`buildNumber` is not a job UUID. Workflow details list job UUIDs. Job details list
each parallel execution and its steps; read `num` from the failing step rather
than assuming that a browser `#step-...` fragment is the API step number.

Inspect all failed executions. To compare with a passing workflow, find the same
job and the execution that actually ran the test: timing-based splitting can move
a file to a different executor. Save full logs in a temporary directory and read
the failure and surrounding context. Condensed output is optional and may omit
useful evidence. Use `circleci testresult --help` and `circleci artifact --help`
when test reports or screenshots are needed.

If the CLI fails before starting with `getting boot time: operation not permitted`,
retry the same read-only command through the tool's sandbox escalation mechanism.
This is not an authentication error. Network restrictions may also require that
mechanism. Do not print the CLI configuration or tokens to diagnose authentication;
use `circleci auth me`. If authentication really is missing, ask the user to log in
with `circleci auth login`, then resume the investigation.

Reading logs does not require rerunning, cancelling, approving, or triggering jobs.
Keep those state-changing operations scoped to the user's request. Compare exact
errors, revisions, test inputs, and execution order before concluding that a test
is flaky. Reproduce locally with the relevant test guide and keep temporary logs
and diagnostic scripts outside the repository.

## Validation des images machine

Les exécuteurs `e2e-executor` et `production-executor` sont fixés à
`ubuntu-2604:2026.07.1` (Ubuntu 26.04 LTS), choisi dans le
[catalogue CircleCI](https://circleci.com/developer/machine/image/ubuntu-2604)
selon la [politique de support](https://circleci.com/docs/guides/execute/linux-vm-support-policy/).
Les paquets système Cypress suivent la
[liste Ubuntu 24.04 et ultérieurs de Cypress](https://docs.cypress.io/app/get-started/install-cypress#Linux-Prerequisites).

La stack de test ne publie pas le port SMTP 25 de Mailcatcher sur la machine :
ce port est déjà occupé sur l'image Ubuntu 26.04. Symfony utilise directement
`smtp://mailcatchersmtp:25` sur le réseau Docker ; seul le port HTTP 1080 reste
publié pour les outils hôte. Le fichier `testing.yml` remplace la liste des ports
avec `!override` (Compose 2.24.4 minimum, disponible dans l'image choisie), pour
éviter que la fusion avec `base.yml` réintroduise le port 25. Le développement
local conserve ses ports habituels.

Cette migration concerne les VM CircleCI, pas l'OS des instances déployées.
L'image QA/production reste basée sur `debian:bookworm-slim` dans
`infrastructure/services/remote/Dockerfile`. Le Compose de production est généré
par `deployment-tools` : son
[template](https://github.com/cap-collectif/deployment-tools/blob/preprod/api/templates/docker-compose.yml.twig)
publie le port HTTP de l'instance vers le port 80, sans Mailcatcher ni publication
SMTP. Il ne consomme pas `infrastructure/environments/testing.yml`.

Sur une branche de travail, lancer séparément les profils `tests` et
`validate-machine-images` :

```bash
circleci run trigger --branch <branche> --parameter ci_profile=tests
circleci run trigger --branch <branche> --parameter ci_profile=validate-machine-images
```

Ils sont également disponibles via `workflow_dispatch` dans le workflow GitHub
Actions `Trigger CircleCI workflows`. `tests` couvre la restauration des images,
les préparations partagées, Cypress, GraphQL, PHPUnit et les migrations.
`validate-machine-images` construit les images QA et production avec les mêmes
jobs et Dockerfile que les workflows habituels, mais avec `publish: false` :
aucune publication Docker, modification de `cluster`, promotion QA, release
Sentry, analyse Docker Scout ou commande de déploiement n'est exécutée.
Ce profil est réservé aux branches de travail, excluant `preprod` et `master`.
Il n'est pas associé à un label de PR et la réconciliation des labels ne
l'annule pas. Une nouvelle demande manuelle de ce profil remplace son ancienne
exécution active sur la même branche.

Comparer l'ancienne et la nouvelle image à code applicatif identique, avec les
mêmes profils, classes de ressources, parallélisme et états de cache. Relever
pour chaque workflow son URL, sa révision, son résultat, sa durée murale et ses
crédits, puis détailler les jobs machine et les phases `CI_TIMING`. Distinguer
l'attente d'allocation, les premières constructions sans cache et les relances.
Les crédits facturés CircleCI sont la référence ; ne pas les déduire de la seule
durée murale d'un workflow parallèle. Une comparaison dont les suites n'ont pas
terminé ne démontre pas un gain de performance.

La configuration des exécuteurs fait partie de l'empreinte Docker. Une modification
de l'image machine renouvelle donc automatiquement sa clé, sans préfixe de version
manuel. Ce premier coût de construction doit être distingué des exécutions à cache chaud.

Vérifier également une construction des images de test sans cache :
`prepare-docker` ne reconstruit pas les images dont les archives existent et ne sont pas vides. Pour une
campagne ponctuelle, omettre la restauration Docker dans une configuration de
validation dédiée et conserver la sauvegarde puis la restauration chez les
consommateurs. Cette modification de configuration possède sa propre empreinte ;
elle n'écrase pas les caches habituels. Conserver les résultats et les éventuelles
limites de la campagne dans la documentation du ticket.

Les [résultats de la campagne #20777](../ci-ubuntu-executors-validation.md)
regroupent les pipelines réussis, les durées et crédits par job, la correction
SMTP et les différences de cache à prendre en compte dans la comparaison.

## Invalidation des caches CircleCI

La source de vérité est `.circleci/generate-cache-keys.sh`. Il calcule les empreintes
des chemins et contenus suivis par Git ; la configuration CI, le script lui-même
et le jeton manuel `.circleci/.circle-cache` font partie de toutes les familles.
Les clés hors Docker et archives de paquets Yarn ajoutent `{{ arch }}`, qui inclut
l'OS, l'architecture, la famille et le modèle du processeur. L'archive
`~/.yarn/berry/cache` utilise la même empreinte que les caches `node_modules` et se
partage entre modèles de processeur. Pour les archives Docker de test, l'empreinte
contient l'OS et l'architecture matérielle (`uname -s` et `uname -m`) de la machine
utilisant un daemon local, indépendamment du modèle de processeur. À entrées identiques,
deux machines Linux x86_64 peuvent partager le cache, mais une machine Linux aarch64
utilise une autre clé.
Les changements habituels invalident automatiquement les caches. Les anciennes clés
ne sont pas restaurées après cette migration ; prévoir un premier run à cache froid.

Pour forcer une invalidation globale, modifier la valeur de `.circleci/.circle-cache`
avec une valeur inédite, commiter et pousser ce changement, puis lancer un pipeline
sur cette révision. Toutes les familles obtiennent de nouvelles clés, y compris
le repli vers `preprod` ; les archives existantes restent stockées mais ne sont plus
sélectionnées par ces clés. Ce levier est réservé aux renouvellements volontaires :
les changements de code ordinaires doivent rester couverts par les empreintes.

Depuis la racine du dépôt :

```bash
bash .circleci/generate-cache-keys.sh dependencies # JS et Composer, avant restauration
bash .circleci/generate-cache-keys.sh relay        # Contrôles statiques, sans traductions
bash .circleci/generate-cache-keys.sh builds       # Builds et Relay, après téléchargement Loco
bash .circleci/generate-cache-keys.sh docker       # Contextes Docker et les deux fichiers Compose
bash .circleci/generate-cache-keys.sh rector       # Configuration, dépendances et fichiers PHP
node --test .circleci/cache-keys.test.cjs
```

Ces commandes nécessitent Bash, Git et les outils SHA-256 (`sha256sum`, `sort -z`,
`xargs -0 -r`), disponibles sur les exécuteurs Linux CI. Elles écrivent seulement
dans `.circleci/cache-keys/`, ignoré par Git. Le mode `builds` nécessite les traductions
déjà téléchargées et les variables publiques du build Next ; les autres modes n'en
dépendent pas. Les tests créent et suppriment leurs propres dépôts temporaires et
n'appellent ni Yarn, ni PHP, ni Docker, ni les services distants.

Pour diagnostiquer une réutilisation incorrecte, comparer les entrées du compilateur
avec celles du générateur, ajouter un test d'invalidation et corriger ce périmètre.
Le détail des familles, des variables publiques et du partage entre branches figure
dans l'[ADR CI](../../ADR/001-continuous_integration.md#cache). Le calcul doit précéder
chaque restauration chez les producteurs et consommateurs, avec une empreinte identique
pour les mêmes entrées. Ne pas recalculer une clé après restauration ou compilation.

Les fichiers générés non suivis sont exclus ; les traductions téléchargées constituent
l'exception explicite pour les builds. Les entrées couvrent notamment `src/Resources/`,
les imports entre frontend et Admin Next, les manifestes des workspaces et les réglages
Node/Yarn. La sélection est conservatrice et peut invalider un build pour un changement
de test ; ne pas la réduire sans vérifier les dépendances réelles.

Les tags Docker distants mutables ne sont pas résolus par le générateur. Pour adopter
une nouvelle image amont, mettre à jour sa référence versionnée, idéalement son digest.
Un cache immuable incorrect peut être contourné globalement en modifiant
`.circleci/.circle-cache`. Une simple relance à entrées identiques conserve les mêmes clés.

## Restauration des dépendances JavaScript

La commande CircleCI `ensure-js-dependencies` restaure le cache des paquets Yarn puis
lance `bash .circleci/install-js-dependencies.sh`.
Le script exécute `yarn install --immutable` à la racine pour réconcilier tous les
workspaces, que les caches soient présents, absents ou partiels. Yarn réutilise les
paquets restaurés et installe ceux qui manquent ; la présence d'un répertoire
`node_modules` ne dispense pas de cette étape. Une erreur Yarn fait échouer le job.
Les jobs consommateurs ne sauvegardent pas les dépendances réparées.

Cette commande est utilisée par `prepare`, `prepare-static`, `typecheck-js`,
`lint-js`, `unit-js`, `prepare-admin-next` et la commande API/Cypress
`start-e2e-container`. Chez les consommateurs, elle suit la restauration du workspace
et des caches `node_modules`, avant les contrôles ou le démarrage des conteneurs.
Le job `migrations` utilise `start-e2e-container` avec `prepare-js: false` pour
démarrer la stack Docker et exécuter PHPUnit directement.

Exécuter `setup-node` avant cette commande. Dans les préparations E2E, terminer
l'installation avant le démarrage Docker : les conteneurs utilisent les dépendances
du répertoire partagé. La phase `CI_TIMING js_dependencies_install` mesure le coût
avec ou sans restauration.

Si une commande devient introuvable après `setup-node`, vérifier la transmission du
`PATH` dans `BASH_ENV`. Le script y ajoute seulement les répertoires de Node et des
exécutables Corepack au `PATH` courant. Conserver son évaluation lors du chargement
du fichier : une copie figée peut écraser les chemins ajoutés par des outils comme
`pyenv`. Le contrat est décrit dans l'[ADR CI](../../ADR/001-continuous_integration.md#version-de-node-et-yarn).

Pour vérifier les scénarios sans modifier les dépendances du checkout, avec Node
de `.nvmrc` et après `corepack enable` :

```bash
node --test .circleci/install-js-dependencies.test.cjs
```

Ce test utilise le vrai Yarn défini par `packageManager`, Bash et `tar`. Il crée puis
supprime des workspaces et un cache Yarn isolés, avec des paquets locaux sans accès
au registre. Corepack doit déjà disposer de la version épinglée de Yarn, comme après
`setup-node`. Il vérifie les caches présents, absents, les restaurations partielles
racine/Admin Next/Cypress et la propagation d'un échec d'installation immuable.

## Restauration des images Docker de test

Le helper `bash .circleci/docker-images.sh prepare` utilise les services et images
du Compose de test. Il construit ou télécharge les images dont `images/<service>.tar`
manque ou est vide, puis sauvegarde chaque archive par renommage atomique. Les archives
présentes ne sont pas chargées par le producteur.

Le mode `load`, utilisé par tous les consommateurs, charge chaque archive et vérifie
le tag attendu. Une archive absente ou inutilisable entraîne la construction ou le
téléchargement du service concerné. Installer les certificats avant ce helper : le
Dockerfile applicatif les copie pendant la construction. Un échec Docker est propagé,
et les consommateurs ne sauvegardent pas de cache CircleCI.

Les phases `CI_TIMING docker_load_*`, `docker_build_*`, `docker_pull_*` et
`docker_save_*` mesurent ces opérations ; `CI_DOCKER_CACHE` indique pour chaque service
`hit`, `miss`, `invalid`, `recovered` ou `archive_present` chez le producteur. Une
reconstruction peut récupérer des versions amont différentes si les références sont
mutables. Le helper ne répare pas l'archive immuable enregistrée par CircleCI.

Prérequis : Bash, `jq` et Docker Compose, déjà présents sur les machines CI.
`node --test .circleci/docker-images.test.cjs` vérifie le helper avec un CLI Docker
simulé, sans daemon ni registre : caches présents, absents, partiels, archives invalides,
propagation des erreurs et nettoyage d'une sauvegarde interrompue. Ce test est exécuté
par `check-cypress-spec-coverage`. Une validation réelle doit également observer le
producteur à cache froid et les chargements chez ses consommateurs dans un workflow.

## Cache Symfony de test partagé

`prepare-test-data` construit le cache Symfony `test` sans debug dans le conteneur
applicatif, sous `/var/www`, puis archive `var/cache/test` dans le workspace du
workflow. Chaque machine restaure cette archive et réinitialise Redis avec le
helper de flags déjà utilisé par Cypress, Jest et PHPUnit. Les effets SQL du reset
des flags ont été appliqués par `capco:reinit` avant la génération du dump partagé.

La construction du cache sous `/var/www` conserve les chemins des proxies Doctrine
et du conteneur Symfony pour les consommateurs. Ce cache appartient au même
workflow et à la même révision que les données restaurées.

Les exécuteurs PHP CircleCI et le conteneur applicatif de `testing.yml` définissent
`APP_DEBUG=0`. Les commandes de préparation, les helpers CLI GraphQL/Cypress et
les kernels PHPUnit utilisent ainsi Symfony sans debug, comme les requêtes HTTP
de test. Le kernel SAML respecte également ce réglage, avec son cache distinct.
Un test peut toujours demander explicitement un kernel debug si son scénario le
nécessite ; les exécutions locales conservent leur réglage habituel.

L’archive ne contient que le cache sans debug, car les dates d’un nouveau checkout
invalident le cache debug. Elle doit être reconstruite pour chaque workflow et sa
révision : sans debug, Symfony ne vérifie pas automatiquement la fraîcheur de ce
cache. Une archive absente ou corrompue fait échouer la restauration.

## Build Admin Next partagé

Le job `prepare-admin-next` construit Admin Next avec `SYMFONY_ENV=test` dans le
conteneur applicatif, en parallèle de `prepare-test-data`. Seuls les jobs Cypress
attendent ce nouveau job dans les workflows `tests`, `test-and-build` et `preprod`.

Le build de production hérité de `prepare` est remplacé avant compilation. Une
archive dédiée au workflow contient le résultat `.next` et les workers MapLibre,
sans le cache du compilateur ni le bundle standalone. Avant sa persistance,
l’archive est copiée sur l’hôte dans `~/admin-next-workspace`, hors des volumes
Docker. Les changements récursifs de propriétaire au démarrage PHP peuvent ainsi
toucher `var/` sans modifier les métadonnées de la copie lue par CircleCI et
provoquer l’erreur tar `file changed as we read it`. Une copie indépendante est
nécessaire ; un lien physique partagerait les mêmes métadonnées. Le chemin relatif
`var/ci-admin-next` reste identique dans le workspace. Chaque machine Cypress
restaure cette archive avant de démarrer Docker, puis lance seulement `next start`.
Le SHA enregistré dans le build doit correspondre à `CIRCLE_SHA1`. Une archive
absente, corrompue ou issue d’une autre révision fait échouer le job, sans rebuild
implicite. Le build destiné aux images QA/production reste celui de `prepare`.

## Vérification et mesure

Vérifications rapides sans services :
`node --test .circleci/admin-next-build.test.cjs` et
`node .circleci/cypress-suites.cjs`.

Les phases `CI_TIMING` distinguent construction, archivage, restauration et flags.
Pour analyser le coût, inclure les jobs de préparation, le stockage et le transfert
du workspace, les phases `admin_next_shared_*`, l’attente HTTP et les tests.
Comparer les mêmes suites et classes de machines, et isoler les relances et les
délais d’allocation des machines.

Le diagnostic à la demande `scripts/agents/workspace-metrics.php` lit les chemins
littéraux de `persist_to_workspace` de `prepare` dans la
configuration, mesure leur taille apparente sans suivre les liens symboliques et
compte les liens physiques une seule fois. Il signale les chemins absents et
détaille `var` et `admin-next/.next` ; les détails se recouvrent et ne doivent pas
être ajoutés au total. Le rapport JSON est écrit hors du workspace et les lignes
`CI_WORKSPACE_SIZE` reprennent ce rapport. Ce diagnostic et ses tests ne sont
plus exécutés automatiquement par `prepare` après la campagne de l’issue #20779.
Les octets compressés réellement transférés et les durées complètes restent
ceux des étapes CircleCI de publication et de restauration.

Pour vérifier le helper localement avec les artefacts présents :
`docker exec -w /var/www capco_application_1 php scripts/agents/workspace-metrics.php`.
Il nécessite les dépendances Composer et GNU `du` ; il écrit seulement son
rapport dans `/tmp/workspace-metrics/prepare.json` dans le conteneur. Un chemin de
sortie peut être fourni en premier argument. La mesure porte sur les artefacts
locaux présents ; elle ne reproduit pas à elle seule le contenu d’un job CI.
Le test `docker exec -w /var/www capco_application_1 node --test scripts/agents/workspace-metrics.test.cjs`
vérifie la configuration réelle, les chemins absents et le comptage des liens
dans des répertoires temporaires, sans utiliser les services applicatifs.

La restauration du runtime crée aussi `var/log/test.log` avec l’utilisateur
applicatif : une commande de test exécutée en `root` ne doit pas créer un fichier
que PHP-FPM ne peut plus ouvrir. Le test
`docker exec -u root -w /var/www capco_application_1 node --test .circleci/test-runtime.test.cjs`
vérifie cette succession avec le vrai handler Monolog et les utilisateurs
`root` et `capco`. Il isole le cache et les logs sous `/var/tmp` dans le conteneur
(hors du montage hôte `/tmp`) et remplace uniquement le reset des feature flags
par un fichier inerte. Il est exécuté par `prepare-test-data` avant la préparation
des données partagées.

### Critère de réussite de la réduction du workspace de préparation

Pour l’issue #20779, le résultat attendu est une réduction mesurée du volume du
workspace de `prepare`, sans régression globale de durée ou de coût pour chacun
des workflows `test-and-build` (profil `full`), `build-prod` et `qa`. Aucun gain
minimum de temps ou de crédits n’est imposé. Un job peut ralentir si son workflow
reste aussi rapide et aussi économique ; un gain sur un workflow ne compense pas
une régression confirmée sur un autre. Le comparatif doit inclure les éventuelles
reconstructions chez les consommateurs : une baisse du volume transféré ne
suffit pas si elle augmente le coût total.

La régénération d’un cache chez un consommateur reste acceptable si le bilan
global respecte ce critère. La suppression intégrale de `var` doit donc être
vérifiée par les mesures : conserver un sous-répertoire précis si sa transmission
reste avantageuse. En particulier, `graphql-doctor` démarre Symfony en
environnement `dev` et peut bénéficier d’un cache déjà construit par `prepare`.

La campagne est progressive : comparer une paire avant/après pour chacun des
workflows `test-and-build` (profil `full`), `build-prod` et `qa`, puis répéter
uniquement les comparaisons ambiguës ou suggérant une régression. Une faible
différence sur une seule paire reste incertaine ; elle ne démontre pas un gain.

La validation des images utilise les workflows existants sur la branche du
ticket, avec publication des images et mise à jour de la QA `qa-20779`. Elle
vérifie la construction puis le démarrage réel de l’image. Le workflow `qa`
requiert une PR ouverte portant le label `🔬 In test` pour promouvoir l’instance.
Le profil `build-prod` publie lui aussi l’image et met à jour le dépôt `cluster`.

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

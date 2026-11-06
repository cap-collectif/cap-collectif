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
sans le cache du compilateur ni le bundle standalone. Chaque machine Cypress
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

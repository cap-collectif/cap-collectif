# Validation des exécuteurs Ubuntu — #20777

Campagne du 13 novembre 2026, sur `20777-ci-ubuntu-executors`, à partir du code
applicatif de `preprod` (`0685417611`). Les changements portent sur la CI, la
publication du port SMTP de la stack de test et la documentation. Les classes de
ressources, le parallélisme, les suites, les préparations partagées et Node
`v20.19.6` sont conservés. Le job Cypress confirme également Yarn `4.18.0` via
Corepack.

## Exécutions réussies

Les mesures proviennent de CircleCI Insights (`duration`, `credits_used`), après
la fin des workflows. La somme des crédits des jobs correspond au total de
chaque workflow. Les durées de jobs parallèles ne doivent pas être additionnées
pour obtenir la durée murale. Les exécutions intermédiaires de diagnostic ne
sont pas incluses dans cette comparaison.

| Profil | Image machine | Révision | Pipeline | Durée | Crédits |
| --- | --- | --- | --- | ---: | ---: |
| Tests — référence | `ubuntu-2004:2023.04.2` | `798cd2860e` | [65356](https://app.circleci.com/pipelines/github/cap-collectif/platform/65356/workflows/f26f3f75-29f3-464f-b2d0-67a347c11f06) | 26 min 54 s | 2810 |
| Tests — migration | `ubuntu-2604:2026.07.1` | `428e02b112` | [65362](https://app.circleci.com/pipelines/github/cap-collectif/platform/65362/workflows/93563442-e53c-47a1-8d87-fd100f435f9e) | 23 min 11 s | 2670 |
| Builds QA/production — référence | `ubuntu-2004:current` | `93fd6223e0` | [65357](https://app.circleci.com/pipelines/github/cap-collectif/platform/65357/workflows/578eef87-3754-4a52-8fb6-84b13fc4a6de) | 11 min 00 s | 216 |
| Builds QA/production — migration | `ubuntu-2604:2026.07.1` | `73b1e747b2` | [65360](https://app.circleci.com/pipelines/github/cap-collectif/platform/65360/workflows/49b9c0ee-6ab4-4a1e-bace-6483d77ce1a1) | 10 min 06 s | 195 |

Les 16 jobs du profil `tests` réussissent dans les deux campagnes : préparation,
images Docker, données et Admin Next partagés, tests unitaires JS/PHP, PHPUnit,
migrations, GraphQL queries/mutations et les six suites Cypress. Ubuntu 26.04
construit les images de test sans cache, les archive, puis les consommateurs les
restaurent et démarrent leur propre stack. Les préparations partagées sont
produites et consommées dans le même workflow.

Les deux jobs de build QA/production réussissent avec `publish: false`. La
configuration compilée a été vérifiée : leurs étapes de publication Docker,
modification de `cluster`, Docker Scout, release Sentry et déploiement sont
absentes. Aucun déploiement d'instance n'a été déclenché pour cette campagne.
La correction SMTP suivante ne touche que `testing.yml`, qui n'est ni utilisé
ni copié par le Dockerfile QA/production ; elle n'invalide pas ces builds.
Cette validation établit la construction des images, pas une recette en production.

## Comparaison des jobs machine

Les jobs consommateurs restaurent les images et les artefacts de leur workflow,
avec les mêmes suites et le même parallélisme. Les deux jobs de build
QA/production construisent le même Dockerfile, sans cache de couches Docker.
`prepare-docker` est l'exception : la référence restaure un cache existant, alors
que la migration construit le nouveau cache ; ses chiffres décrivent ce premier
coût et ne constituent pas une comparaison à cache chaud.

| Job machine | Ubuntu 20.04 : durée / crédits | Ubuntu 26.04 : durée / crédits |
| --- | ---: | ---: |
| `prepare-docker` | 1 min 22 s / 5 | 5 min 14 s / 52 |
| `prepare-test-data` | 5 min 19 s / 45 | 4 min 39 s / 46 |
| `prepare-admin-next` | 5 min 39 s / 48 | 4 min 54 s / 49 |
| `migrations` | 3 min 05 s / 31 | 2 min 59 s / 30 |
| `phpunit-tests` | 7 min 51 s / 276 | 7 min 04 s / 272 |
| `api-graphql-tests-queries` | 6 min 30 s / 216 | 5 min 10 s / 203 |
| `api-graphql-tests-mutations` | 9 min 21 s / 490 | 7 min 48 s / 454 |
| `cypress-accounts-access` | 11 min 00 s / 198 | 10 min 37 s / 212 |
| `cypress-consultations-debates` | 9 min 08 s / 244 | 8 min 09 s / 238 |
| `cypress-projects-navigation` | 13 min 42 s / 224 | 9 min 42 s / 184 |
| `cypress-proposals` | 11 min 03 s / 293 | 10 min 52 s / 301 |
| `cypress-questionnaires` | 11 min 30 s / 106 | 11 min 03 s / 111 |
| `cypress-site-content` | 11 min 33 s / 310 | 10 min 16 s / 297 |
| `build-qa-image` | 5 min 06 s / 51 | 7 min 16 s / 68 |
| `build-production-image` | 5 min 25 s / 54 | 7 min 21 s / 73 |

## Interprétation et limites

Le total des workflows baisse sur cette paire, mais ne démontre pas à lui seul
un gain causé par Ubuntu 26.04. `prepare` utilise encore un exécuteur Docker
`cimg/php`, pas la VM migrée : ses builds JavaScript sont reconstruits dans la
référence et réutilisés depuis le cache dans la migration. Dans le profil
`tests`, il passe de 372 s / 123 crédits à 119 s / 39 crédits ; dans le profil de
builds, de 335 s / 111 crédits à 164 s / 54 crédits. L'allocation des machines et
la répartition dynamique des fichiers de test peuvent aussi modifier les durées.

Hors `prepare`, tests unitaires JS/PHP et construction du cache Docker, les jobs
machine du workflow de tests consomment 2481 crédits sur Ubuntu 20.04 contre
2397 sur Ubuntu 26.04. Les résultats restent ceux d'une seule paire, sans seuil
de gain garanti.

Les builds Docker présentent une régression mesurée : QA et production coûtent
ensemble 105 crédits sur Ubuntu 20.04 contre 141 sur Ubuntu 26.04. Dans le build
production, l'export de l'image passe de 14,8 s à 120,4 s, dont 97,5 s d'export de
couches et 22,7 s de décompression dans le nouveau moteur. Le Dockerfile et le
contenu applicatif n'ont pas été modifiés pour masquer cette différence ; le
bénéfice du cache de `prepare` ne doit pas être attribué à ces builds. La
migration apporte une image supportée et une compatibilité validée, sans
promesse d'amélioration de performance de chaque job.

## Compatibilité SMTP et contrôles locaux

Le premier essai 26.04 a reproduit le même conflit dans les deux préparations :
le port hôte 25 était déjà occupé au lancement de Mailcatcher. La configuration
Compose résolue publiait `25:25`, alors que Symfony utilise déjà
`smtp://mailcatchersmtp:25` sur le réseau Docker. `testing.yml` remplace donc la
liste des ports publiés par le seul accès HTTP `1080:80`, avec `!override`.

Le contrôle de la configuration Compose a échoué avant la correction et réussi
après : aucun port SMTP publié, accès HTTP conservé, DSN interne inchangé.
La campagne 65362 confirme ensuite le démarrage des deux préparations et la
réussite de toutes les suites. La configuration CircleCI finale est valide,
les profils compilés utilisent le tag 26.04 choisi et les 48 tests du déclencheur
CI passent, dont l'isolation du nouveau profil manuel vis-à-vis des labels de PR.

Voir [le guide CircleCI](agents/circleci.md#validation-des-images-machine) pour
relancer la validation et pour la distinction entre la stack de test et la
configuration de production.

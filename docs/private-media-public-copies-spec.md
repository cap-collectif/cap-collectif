# Médias privés : reprise historique et refus des nouvelles réutilisations

## Statut et objectif

Spécification cible issue des échanges du 23 octobre 2026. Ce document décrit le comportement à implémenter, et non le comportement actuellement déployé.

Séparer les médias historiquement partagés entre usages publics et réponses privées, sans changer les URL publiques existantes. Empêcher ensuite les nouveaux partages : un contenu public ne peut pas réutiliser un média privé.

La copie privée est exclusivement un mécanisme de reprise de l'existant. Aucun service de conversion automatique à la publication ni de synchronisation permanente original/copie n'est requis.

Cette décision remplace l'approche de révocation après suppression de la dernière référence publique étudiée sur la branche `20499`. Cette nouvelle branche repart de `preprod` sans reprendre ce mécanisme. L’ADR de distribution des médias et le glossaire décrivent également cette approche.

## Nouveaux contenus et nouvelles publications

Un upload public crée son propre média public. Un upload privé crée son propre média privé. Les flux d'upload doivent déterminer ce contexte côté serveur selon les permissions et la destination du fichier.

Un contenu public ne peut pas référencer un média privé, même si l'auteur est son uploader, un administrateur ou un lecteur autorisé. Il n'y a pas de copie automatique, de retrait de marqueur ni de recherche d'un ancien original public pour contourner ce refus. Pour publier le fichier, l'utilisateur doit effectuer un upload distinct dans le contexte public autorisé.

Cette règle couvre :

- Les couvertures de propositions et de projets.
- Les images et liens de fichiers dans les WYSIWYG publics, y compris les URL collées manuellement.
- Les descriptions et réponses éditeur publiques des propositions.
- Les chemins équivalents d'administration, de mutation et d'import.

La validation est côté serveur et intervient avant toute modification persistée. Le refus identifie le champ et le média concernés ; le formulaire conserve le contenu saisi. Les permissions de lecture sur une réponse privée ne sont pas modifiées.

Un brouillon ou un contenu privé peut conserver des références privées selon ses permissions habituelles. Lorsqu'il devient public, ces références provoquent le même refus, même si le HTML n'a pas changé. Les changements de visibilité du contexte parent doivent également être couverts. Un média déjà public reste réutilisable dans les contenus publics selon les règles existantes. Une nouvelle réponse confidentielle doit utiliser un upload privé distinct ; elle ne peut pas rendre privé un fichier public, même s'il n'a pas été traité par la reprise historique.

Passer une question éditeur en privé ou la cacher vérifie également les fichiers de ses
réponses existantes. Si une réponse référence un fichier public, la modification est refusée
avant enregistrement et demande un upload privé distinct.

Les références internes sont reconnues à partir des hôtes configurés, sans faire confiance au Host de la requête. Vérifier les formats réellement émis par les éditeurs : images, liens, miniatures et éventuels `srcset`. Les URL externes ne sont pas téléchargées ou converties par ce mécanisme.

## Reprise de l'existant

Une commande Symfony dédiée traite les médias privés déjà utilisés par des contenus actuellement publics. Pour chaque média éligible :

1. Créer une copie privée avec un identifiant, un fichier et une URL distincts.
2. Transférer vers cette copie toutes les associations de réponses privées utilisant l'original, ainsi que les références confidentielles prises en charge.
3. Rendre l'original public uniquement après réussite de la copie et du transfert.

Les couvertures de propositions ou de projets conservent leur association vers l'original. Les images et liens des WYSIWYG publics conservent leurs URL. Le fichier original et les URL de ses dérivés publics ne changent pas.

Un original partagé entre une réponse privée et cinq contenus publics donne deux médias et deux fichiers sources : une copie privée pour la réponse et l'original public pour les cinq usages. Plusieurs réponses privées utilisent la même copie avec leurs permissions habituelles. Les miniatures ne sont pas comptées dans ces deux fichiers.

L'original reste public après suppression de sa dernière référence. Son ancienne URL, même lorsqu'elle était auparavant privée, devient accessible à toute personne qui la connaît. La nouvelle URL de la copie reste protégée. Une nouvelle réponse confidentielle ne peut pas rattacher cet original pour le rendre privé à nouveau : elle doit utiliser un nouvel upload privé. Les deux fichiers contiennent initialement les mêmes informations : la copie protège les accès à la réponse privée, mais ne rend pas confidentiel le contenu déjà publié.

### Éligibilité et références à transférer

La commande doit constater un usage actuellement public dans le périmètre inventorié. Un ancien marqueur de publication ou plusieurs références en base ne suffisent pas à autoriser l'ouverture du fichier. Les brouillons et contenus privés ne constituent pas une preuve de publication.

Le transfert couvre toutes les réponses confidentielles concernées : questionnaires, questions privées ou cachées et réponses d'analyse selon les règles existantes. Il ne modifie ni leur contenu métier ni leurs permissions. Leurs références techniques au média changent.

Les éventuelles références HTML privées doivent être remplacées par les URL de la copie privée. Les URL publiques restent inchangées. Si un rattachement confidentiel identifié ne peut pas être transféré de façon fiable, le média est signalé et laissé inchangé.

Les fichiers manquants et références ambiguës sont signalés sans ouverture de l'original. Les messages vocaux sont exclus. Pour un média marqué privé ayant un usage public confirmé mais aucune référence confidentielle restante, la commande peut rendre l'original public sans créer de copie inutile ; ce cas apparaît séparément dans la simulation.

L'application de la commande constitue une opération administrative explicite de reprise historique, y compris pour les médias dont l'uploader est inconnu. Elle n'autorise pas de nouvelles publications privées depuis les formulaires.

Les médias historiques utilisés exclusivement dans des réponses HTML confidentielles sont
classés privés sur place, avec leurs rattachements aux réponses, sans copie ni changement
d’URL. L’audit les signale comme éligibles jusqu’à cette classification.

### Exécution et reprise après erreur

La commande propose une simulation par défaut, sans mutation de la base ni du stockage, et une option explicite d'application. Elle travaille par lots et fournit progression, bilan et erreurs par média ou contenu, sans exposer les réponses privées.

Elle doit être relançable après interruption et ne pas recréer une copie pour un média déjà traité. Un suivi durable de conversion suffit à cette idempotence ; une relation utilisée par les flux applicatifs futurs n'est pas nécessaire. Son support exact sera choisi à l'implémentation. Une migration Doctrine prépare uniquement le schéma éventuellement nécessaire, sans copier de fichiers.

La copie privée est protégée dès sa création. Le transfert des associations et l'ouverture de l'original sont validés ensemble en base, après vérification du fichier copié. Les marqueurs qui classaient l'original comme privé sont traités de manière cohérente avec le résolveur ; leur seul retrait ne remplace pas le transfert des références.

Une erreur de stockage ou de transaction ne doit laisser ni référence cassée ni original nouvellement public. Les fichiers incomplets sont nettoyés ou repris de manière contrôlée. Les protections doivent aussi couvrir les miniatures et la génération d'images de la copie.

L'exécution doit empêcher les modifications concurrentes des associations privées pendant la conversion, par une fenêtre sans écritures sur les contenus concernés ou une synchronisation adaptée. Le rapport de simulation ne suffit pas : l'éligibilité et les rattachements sont revérifiés lors de l'application.

Cette commande remplace le besoin de conversion de l'historique. Elle est distincte de l'ancienne réconciliation supprimée, qui enregistrait seulement un marqueur.

## Déploiement

Le déploiement est séparé en trois PR :

1. `20499-prevent-private-media-reuse` classe les nouveaux uploads et refuse les nouvelles
   références privées dans les contenus publics. Les exceptions HTTP et GraphQL restent actives.
2. `20499-prepare-private-media-split` ajoute la commande de reprise et les protections des
   originaux convertis. Déployer après la première PR, puis auditer et convertir chaque instance.
   Les copies sont marquées privées, mais leurs URL directes restent accessibles pendant cette phase.
3. `20499-enforce-private-media-reads` ajoute le toggle `private_media_read_enforcement`,
   désactivé par défaut. Les exceptions de lecture HTTP et GraphQL restent actives jusqu’à
   son activation explicite par instance. Les fichiers vocaux restent réservés aux administrateurs, quel que soit le flag. Vérifier alors le refus anonyme sur les copies et leurs miniatures.

Avant d’activer le toggle, chaque instance doit avoir un audit terminé, sans erreur non résolue,
et sans média éligible restant après conversion. Ne pas confondre `completed: true` avec
l'absence d'erreurs. Conserver les rapports par instance. Limiter le délai avant l’activation des permissions.

1. Inventorier les usages historiques à reprendre et les points d'entrée permettant de nouvelles références privées dans des contenus publics. Vérifier aussi les migrations de confidentialité présentes sur la branche ; un nombre de références ne prouve pas qu'un média est public.
2. Déployer le refus des nouvelles réutilisations et des publications contenant un média privé. Les éventuels contenus historiques refusés lors d'une édition doivent être repris par la commande, sans exception permanente dans la validation.
3. Exécuter la simulation, examiner les exceptions et appliquer la reprise avec la protection nécessaire contre les écritures concurrentes.
4. Vérifier que les références privées ont été transférées, que les copies sont marquées privées et que les URL publiques restent inchangées. Traiter les exceptions avant de retirer la compatibilité de lecture correspondante.
5. Activer `private_media_read_enforcement` sur l’instance après validation de la reprise. Les originaux convertis sont publics par classification ; les copies et les autres médias privés restent soumis aux permissions.
6. Renouveler les caches applicatifs et invalider les données mises en cache contenant les anciens rattachements privés. Contrôler originaux, copies, miniatures, génération d'images et métadonnées GraphQL.

Le toggle contrôle uniquement les lectures directes HTTP et les champs Media GraphQL internal/preview.
Désactivé, il rend les URL privées connues accessibles ; les protections d’écriture,
les téléchargements de réponses et les en-têtes `private, no-store` restent en place.
Activer avec `docker exec -w /var/www capco_application_1 bin/console capco:toggle:enable private_media_read_enforcement`.
Pour rétablir temporairement la compatibilité de lecture, utiliser la même commande avec
`capco:toggle:disable`. Le changement s’applique aux requêtes suivantes sans reconstruction GraphQL. Aucune redirection anonyme de la copie privée vers l'original public n'est ajoutée. L'optimisation des caches publics est un travail séparé.

## Critères d'acceptation

| Scénario | Résultat attendu |
| --- | --- |
| Existant : une réponse privée et cinq usages publics | Une copie privée pour la réponse ; original public et cinq URL publiques inchangées |
| Existant : plusieurs réponses privées | Toutes transférées vers la même copie, permissions inchangées |
| Existant : couverture de proposition ou de projet | Identifiant et URL de l'original conservés |
| Existant : image ou lien dans un WYSIWYG public | URL inchangée après conversion |
| Existant : référence HTML privée prise en charge | Réécrite vers la copie privée |
| Existant : ancienne URL de l'original connue | Accessible anonymement après conversion, conformément au choix produit |
| Existant : URL de la copie privée connue | Accès anonyme refusé, aucune redirection vers l'original |
| Existant : média public confirmé sans rattachement confidentiel restant | Original rendu public sans copie inutile, cas identifié dans le rapport |
| Existant : usage confidentiel non transférable ou fichier manquant | Cas signalé, original non ouvert |
| Simulation | Aucune écriture en base ou dans le stockage |
| Interruption puis relance | Reprise sans duplication ni ouverture partielle |
| Modification concurrente d'un rattachement | Bloquée ou détectée avant conversion, aucune association privée oubliée |
| Nouvelle couverture réutilisant un média privé | Refus, aucune copie et aucun changement de classification |
| Nouvelle image ou lien privé collé dans un WYSIWYG public | Même refus, y compris pour l'uploader et l'administrateur |
| Nouvelle référence à une copie privée issue de la reprise | Refus, aucune résolution automatique vers l'original public |
| Passage en public sans changement du texte | Refus si une référence privée subsiste |
| Upload distinct dans un contexte public autorisé | Nouveau média public, indépendant du média privé |
| Média déjà public | Réutilisation selon les règles existantes, aucune duplication automatique |
| Retrait du dernier usage d'un original converti | Original toujours accessible par son URL |
| Message vocal | Aucune conversion ni publication par ce mécanisme |

## Commande et procédure opératoire

```bash
# Simulation, sans écriture
 docker exec -w /var/www capco_application_1 bin/console capco:media:split-historical-private
# Limiter l'inventaire à un média
 docker exec -w /var/www capco_application_1 bin/console capco:media:split-historical-private --media-id=UUID
# Pendant une fenêtre sans écritures uniquement
 docker exec -w /var/www capco_application_1 bin/console capco:media:split-historical-private --apply --maintenance-confirmed --batch-size=100
```

Pour consolider les audits, `--format=json` écrit un seul objet JSON sur la sortie standard,
sans progression ni messages texte. Par exemple, depuis chaque instance :

```bash
docker exec -w /var/www capco_application_1 bin/console capco:media:split-historical-private --format=json --no-debug > audit-instance.json
```

Le rapport contient `mode` (`simulation` ou `apply`), `completed`, `checked_media_count`,
`eligible_media_ids`, `converted_media_ids`, `errors` et `duration_seconds`. Chaque erreur
contient `media_id` et `message` ; un ID nul indique une erreur globale ou une option invalide.
`completed: true` signifie que le parcours est terminé, pas que toutes les vérifications ont
réussi. Un audit sans cas détecté doit avoir `completed: true`, aucune erreur et aucune entrée
éligible. Les erreurs par média conservent un code de sortie 1 ; les options invalides donnent 2.
Conserver le rapport même quand la commande retourne un code non nul. Une interruption forcée
ou un échec avant le démarrage de la commande peut ne produire aucun JSON : l’orchestrateur
doit alors classer l’instance comme audit incomplet, jamais comme sans anomalie. Associer le
fichier de résultat à l’instance dans l’orchestrateur ; le rapport ne contient pas ses secrets
de connexion. La durée mesure l’exécution de la commande, hors démarrage du kernel Symfony.

Avant `--apply`, arrêter les écritures web, imports, consommateurs et purges qui peuvent
modifier les contenus, médias ou fichiers concernés. `--maintenance-confirmed` atteste
cette opération ; il ne met pas lui-même l’application en maintenance. Un verrou MySQL
empêche deux commandes de reprise de s’exécuter simultanément. Sauvegarder base et stockage
avant l’application, examiner la simulation et traiter les erreurs signalées. Réactiver
les écritures après vérification et invalidation des caches contenant les anciens liens.

L’inventaire parcourt les contenus une seule fois et construit en mémoire un index des
identifiants de contenus par média. Il ne crée aucune table ni fichier de suivi pendant la
simulation. Les objets Doctrine sont libérés par lots, selon `--batch-size`. Une première
progression indique les contenus examinés, puis une seconde indique les médias vérifiés.
Le bilan final liste les IDs des médias éligibles en simulation, ou ceux effectivement
convertis en application, avec le nombre de références publiques et confidentielles.
Les références indexées sont relues pour vérifier leur état avant chaque conversion ; la
fenêtre sans écritures doit donc couvrir l’inventaire et toute l’application. `--media-id`
limite les médias à traiter, mais conserve l’inventaire complet des contenus.

L’inventaire examine les associations Doctrine vers les médias et les références HTML
internes. Les couvertures de projets publics, les propositions visibles et leurs réponses
publiques, ainsi que les corps des pages, thèmes, articles, événements et étapes publics
constituent des preuves de publication. Les annotations internes, champs inconnus et
contenus privés non transférables ne constituent pas une preuve ; ils bloquent la conversion
s’ils partagent un média à convertir. Les réponses confidentielles de type média et les
réponses éditeur privées sont transférables.

Le suivi est conservé dans `provider_metadata` : `historical_private_copy` sur l’original,
`historical_original_id` sur la copie, et `historical_public_original` pour préserver
l’original des suppressions liées au retrait d’un avatar. L’identifiant de copie est
déterministe. Un fichier laissé par une interruption est réutilisé seulement si son contenu
correspond à la source. Les associations sont transférées dans la même transaction que
l’ouverture de l’original, après vérification SHA-256. Une erreur conserve l’original privé.

La copie possède son propre fichier source : un recadrage de l’original ne modifie pas la
copie. Les références HTML privées sont vérifiées au moment des lectures ; leur métadonnée
de rattachement ne suffit pas à accorder un accès si la réponse ne contient plus le lien.
Un nouveau rattachement HTML privé exige les permissions de lecture préexistantes.

La suppression administrative d’un original publié par erreur doit également retirer ses
dérivés et invalider les caches. Elle ne récupère pas les fichiers déjà téléchargés.

## Hors périmètre

La conversion automatique des nouveaux usages, la synchronisation permanente original/copie, la révocation automatique après le dernier usage public, le maintien de la confidentialité de l'ancienne URL originale après conversion, un registre général des usages, la déduplication entre uploads distincts, la publication de messages vocaux et l'élargissement des droits de lecture des réponses privées.

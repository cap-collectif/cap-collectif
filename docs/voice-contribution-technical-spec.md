# Spécification technique — Dépôt vocal

## 1. Objet du document

Ce document décrit l’implémentation technique de la fonctionnalité de dépôt vocal définie dans [la spécification métier](voice-contribution-business-spec.md).

Il couvre :

- la structure de données ;
- l’activation par feature flag et par étape ;
- la route REST d’upload ;
- la mutation GraphQL de rattachement et de déclenchement du parcours ;
- la finalisation des requirements ;
- la Query BO ;
- la lecture sécurisée des fichiers ;
- la réconciliation des participants ;
- la validation et les tests ;
- les migrations et le déploiement.

Les extraits de code sont des exemples de structure à adapter aux namespaces et aux conventions exactes du dépôt.

## 2. Décisions retenues

### 2.1 Modèle général

`VocalContribution` porte les informations métier du dépôt vocal.

`Media` porte le fichier et ses métadonnées dans la table existante `media__media`.

Le fichier audio ne doit pas être ajouté dans une nouvelle table de fichiers et ne doit pas être exposé dans le répertoire public des médias.

### 2.2 Parcours

- Le dépôt est disponible depuis la page d’accueil.
- Une seule `CollectStep` du projet est activée pour les vocaux.
- La route REST crée le média et la contribution vocale.
- La mutation GraphQL rattache la contribution au participant ou à l’utilisateur et détermine si le parcours de requirements doit être déclenché.
- Une contribution sans requirements est immédiatement `COMPLETED`.
- Une contribution avec requirements non remplis est `MISSING_REQUIREMENTS`.
- La validation du parcours fait passer la contribution à `COMPLETED`.
- Le consentement facultatif est évalué séparément des requirements de l’étape.
- Le consentement est demandé si le contributeur ne l’a jamais accepté, même lorsque l’étape ne comporte aucun requirement.
- Le refus du consentement facultatif ne bloque jamais le passage à `COMPLETED`.
- Aucun objet `Proposal` n’est créé.
- Le contenu audio est immuable après l’upload.
- L’utilisateur ne dispose pas d’une Query listant ses propres vocaux.
- Le BO liste les contributions `COMPLETED` et `MISSING_REQUIREMENTS`.
- Le BO propose un téléchargement individuel et un export global des fichiers audio.

### 2.3 Limites actuelles

- Durée minimale : 10 secondes.
- Durée maximale : 180 secondes.
- Taille maximale initiale : réutiliser `media_size_limit`, actuellement configuré à 10 MiB, sauf décision contraire.
- Antivirus : hors périmètre initial.
- Suppression utilisateur : hors périmètre initial.
- Nettoyage automatique des contributions abandonnées : hors périmètre initial.

## 3. Architecture cible

```text
Page d’accueil
    |
    | 1. POST /api/voice-messages (multipart/form-data)
    v
Media privé + VocalContribution
    |
    | retour vocalId
    |
    | 2. AddVocalContributionMutation(vocalId, participantToken?)
    v
VocalContribution COMPLETED ou MISSING_REQUIREMENTS
    |
    | 3. Si requirements manquants : parcours existant
    v
ValidateContributionMutation(contributionId, token?)
    |
    v
VocalContribution COMPLETED
    |
    v
Retour home
```

La mutation `AddVocalContributionMutation` ne reçoit pas le contenu binaire. Le fichier est déjà persisté par la route REST ; la mutation travaille sur l’identifiant opaque de la contribution.

## 4. Fichiers et composants à créer ou modifier

### Domaine et persistance

- `src/Capco/AppBundle/Entity/VocalContribution.php`
- `src/Capco/AppBundle/Repository/VocalContributionRepository.php`
- `src/Capco/AppBundle/Enum/ContributionCompletionStatus.php` : réutiliser l’enum existant.
- migration Doctrine pour `vocal_contribution` et `collect_step.is_vocal_contribution_enabled`.
- `src/Capco/AppBundle/Entity/Steps/CollectStep.php`
- `src/Capco/AppBundle/Form/Step/CollectStepFormType.php`

### Upload et stockage

- adapter `src/Capco/AppBundle/Controller/Api/MediasController.php::postVoiceMessageAction()` du POC pour créer la `VocalContribution` et conserver la route `POST /api/voice-messages` ;
- service d’upload ou manager dédié si la logique ne tient pas proprement dans l’action existante ;
- adaptation de `MediaManager` pour le contexte vocal et l’absence de flush partiel ;
- adaptation de `MediaProvider` pour le stockage privé ;
- `src/Capco/AdminBundle/Controller/VoiceMessageController.php` pour la lecture et les routes BO du POC.

### GraphQL

- `AddVocalContributionMutation` et ses fichiers Input/Payload ;
- support de `VocalContribution` dans `ValidateContributionMutation` ;
- type GraphQL `InternalVocalContribution` ;
- connexion `InternalVocalContributionConnection` ;
- Query `vocals` dans `InternalQuery.types.yaml` ;
- mutation dans `InternalMutation.types.yaml` ;
- ajout de `VocalContribution` à `GlobalIdResolver::AVAILABLE_TYPES` ;
- enum existant `ContributionCompletionStatus`.

### Réconciliation et BO

- `VocalContributionReconcilier` ;
- branchement dans `VerifyParticipantPhoneNumberMutation` ;
- resolver/repository de liste BO ;
- interface BO de liste et de réécoute ;
- adaptation de `src/Capco/AppBundle/Controller/Site/ExportController.php` pour l’export global ;
- commande d’export dédiée utilisant le mécanisme `ExportOnDemandManager` existant ;
- traductions et feature list.

## 5. Feature flag et configuration de l’étape

### 5.1 Feature flag global

Ajouter `vocal_contribution` dans `Capco\AppBundle\Toggle\Manager` :

```php
final public const vocal_contribution = 'vocal_contribution';
```

Ajouter le flag :

1. à la liste `$toggles` ;
2. à `SUPER_ADMIN_ALLOWED_FEATURES` ;
3. à `admin-next/components/BackOffice/FeatureList/FeatureItems.json`, dans le groupe « Autres » ;
4. aux traductions du titre et de la description.

Exemple de configuration BO :

```json
"vocal_contribution": {
  "title": "capco.module.vocal_contribution",
  "description": "description.module.vocal_contribution",
  "onlySuperAdmin": true
}
```

Le flag doit être vérifié côté backend sur la route REST, la mutation GraphQL, la Query BO et la mise à jour de la configuration de l’étape. Le front ne doit pas être considéré comme une frontière de sécurité.

### 5.2 Champ de `CollectStep`

Ajouter à `CollectStep` :

```php
/**
 * @ORMColumn(
 *     name="is_vocal_contribution_enabled",
 *     type="boolean",
 *     nullable=false,
 *     options={"default": 0}
 * )
 */
private bool $isVocalContributionEnabled = false;

public function isVocalContributionEnabled(): bool
{
    return $this->isVocalContributionEnabled;
}

public function setIsVocalContributionEnabled(bool $enabled): self
{
    $this->isVocalContributionEnabled = $enabled;

    return $this;
}
```

Ajouter le champ :

- dans `CollectStepFormType` ;
- dans `UpdateCollectStepInput.types.yaml` ;
- dans le type GraphQL interne de `CollectStep` ;
- dans l’interface d’administration de l’étape.

Le champ ne doit être affiché et modifiable que si `vocal_contribution` est actif. Le backend doit refuser une activation lorsque le feature flag global est désactivé.

Exemple GraphQL :

```yaml
isVocalContributionEnabled:
    type: 'Boolean!'
    description: 'Whether voice contributions are enabled on this collect step.'
```

### 5.3 Recherche de l’étape

Le projet concerné ne possède qu’une seule étape activée. Le repository peut donc exposer :

```php
public function findVocalContributionStep(): ?CollectStep
{
    return $this->findOneBy([
        'isVocalContributionEnabled' => true,
    ]);
}
```

Le service appelant doit gérer l’absence de configuration :

```php
$step = $this->collectStepRepository->findVocalContributionStep();

if (!$step) {
    throw new UserError('No collect step is configured for vocal contributions.');
}
```

Même si l’instance actuelle n’a qu’une étape, il faut éviter de sélectionner silencieusement une étape arbitraire si la configuration devient incohérente. Un contrôle d’administration ou un test de non-ambiguïté est recommandé.

## 6. Structure de la base de données

### 6.1 Table `vocal_contribution`

Structure cible :

| Colonne | Type | Null | Rôle |
|---|---|---:|---|
| `id` | `guid` | non | Identifiant UUID de la contribution |
| `user_id` | `guid` | oui | Utilisateur identifié |
| `participant_id` | `guid` | oui | Participant anonyme |
| `media_id` | `guid` | non | Média audio dans `media__media` |
| `completion_status` | `varchar(255)` | non | `COMPLETED` ou `MISSING_REQUIREMENTS` |
| `created_at` | `datetime` | non | Date du dépôt |

Contraintes recommandées :

- clé primaire sur `id` ;
- unicité sur `media_id` : un média ne peut appartenir qu’à un vocal ;
- index sur `completion_status, created_at` pour le BO ;
- index sur `user_id` ;
- index sur `participant_id` ;
- `user_id` et `participant_id` peuvent être nuls, mais une contribution active doit avoir un propriétaire courant ;
- lors d’un rattachement à un utilisateur, suivre la convention du projet pour remplacer ou conserver le participant.

Exemple de mapping Doctrine :

```php
/**
 * @ORMTable(name="vocal_contribution", indexes={
 *     @ORMIndex(name="idx_vocal_status_created", columns={"completion_status", "created_at"}),
 *     @ORMIndex(name="idx_vocal_user", columns={"user_id"}),
 *     @ORMIndex(name="idx_vocal_participant", columns={"participant_id"})
 * })
 * @ORMEntity(repositoryClass="Capco\AppBundle\Repository\VocalContributionRepository")
 */
class VocalContribution implements EntityInterface
{
    use UuidTrait;
    use CompletionStatusTrait;
    use TimestampableTrait;

    /**
     * @ORMOneToOne(targetEntity="Capco\AppBundle\Entity\Media")
     * @ORM\JoinColumn(name="media_id", referencedColumnName="id", nullable=false, unique=true, onDelete="RESTRICT")
     */
    private Media $media;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\UserBundle\Entity\User")
     * @ORM\JoinColumn(name="user_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?User $user = null;

    /**
     * @ORM\ManyToOne(targetEntity="Capco\AppBundle\Entity\Participant")
     * @ORM\JoinColumn(name="participant_id", referencedColumnName="id", nullable=true, onDelete="SET NULL")
     */
    private ?Participant $participant = null;

    public function getParticipant(): ?Participant
    {
        return $this->participant;
    }
}
```

Le mapping exact des `onDelete` doit être validé avec les conventions de suppression du projet. La contribution doit rester protégée même si une identité est supprimée ; la suppression explicite du média n’est pas dans le périmètre initial.

### 6.2 Modification de `collect_step`

La migration ajoute une colonne booléenne avec une valeur par défaut désactivée :

```sql
ALTER TABLE collect_step
    ADD is_vocal_contribution_enabled TINYINT(1) NOT NULL DEFAULT 0;
```

La migration doit être générée et vérifiée avec Doctrine plutôt que recopiée aveuglément depuis cet exemple.

### 6.3 Média

Le média audio est créé dans `media__media` avec :

```php
$media->setContext('vocal_contribution');
$media->setEnabled(true);
$media->setContentType($uploadedFile->getMimeType());
$media->setSize($uploadedFile->getSize());
$media->setLength($durationInSeconds);
$media->setMetadataValue('private_attachment', '1');
```

Le champ `length` existant peut porter la durée en secondes si sa précision est suffisante. Il ne faut pas ajouter de doublon dans `VocalContribution`.

## 7. Entité et règles de domaine

### 7.1 Interface et statut

`VocalContribution` réutilise `CompletionStatusTrait` pour exposer :

- `getCompletionStatus()` ;
- `setMissingRequirementsStatus()` ;
- `setCompletedStatus()` ;
- `getParticipant()`.

Elle n’implémente pas `ContributionInterface` : cette interface impose que l’étape
soit portée par l’entité via `getStep()`, alors que l’étape de dépôt vocal est une
configuration unique du projet et n’est pas une propriété persistée du vocal.
Les services qui doivent évaluer les requirements récupèrent explicitement
l’étape avec `CollectStepRepository::findVocalContributionStep()`.

Le trait `CompletionStatusTrait` existant fournit déjà l’enum et les transitions principales.

Le statut initial recommandé après l’upload est `MISSING_REQUIREMENTS`. `AddVocalContributionMutation` le passe à `COMPLETED` si le contributeur satisfait déjà les requirements.

### 7.2 Propriétaire

Le modèle doit empêcher les rattachements arbitraires :

```php
public function setContributor(ContributorInterface $contributor): self
{
    if ($contributor instanceof User) {
        $this->user = $contributor;
        $this->participant = null;
    } elseif ($contributor instanceof Participant) {
        $this->participant = $contributor;
        $this->user = null;
    }

    return $this;
}
```

Si la convention de réconciliation du projet conserve les deux références, cette méthode doit être adaptée. Il faut cependant définir une source d’identité courante unique pour les contrôles d’accès.

### 7.3 Immutabilité du fichier

Après création :

- aucune mutation ne remplace le média ;
- aucune mutation ne change son contenu ;
- `media_id` ne peut pas être remplacé par le client ;
- seule la transition `MISSING_REQUIREMENTS → COMPLETED` est autorisée.

## 8. Route REST d’upload

### 8.1 Route

Ajouter un contrôleur API chargé uniquement du dépôt vocal :

```php
/**
 * @Route("/voice-messages", name="upload_voice_message", methods={"POST"}, options={"i18n" = false})
 */
```

Le contrôleur reprend la route du POC, chargée sous le préfixe `/api` existant :

```text
POST /api/voice-messages
```

Ne pas réutiliser la route générique `/api/files` : elle ne connaît ni la durée, ni l’étape, ni le propriétaire, ni le contexte privé du vocal.

### 8.2 Requête

Requête `multipart/form-data` :

| Champ | Obligatoire | Description |
|---|---:|---|
| `file` | oui | Fichier audio enregistré |
| `participantToken` | non | Token du participant anonyme courant |

L’utilisateur connecté est déterminé par le contexte de sécurité. Pour un utilisateur anonyme, le participant est récupéré depuis le token ou créé selon les helpers existants.

La requête doit également fournir la protection CSRF utilisée par le POC : un header `X-CSRF-Token` avec le token de l’action `voice_message`.

### 8.3 Réponse

Réponse `201 Created` :

```json
{
  "vocalId": "Vm9jYWxDb250cmlidXRpb246ZjQw...",
  "participantToken": "participant-token"
}
```

`vocalId` est l’identifiant global opaque de `VocalContribution`, pas un chemin de fichier et pas un identifiant SQL brut.

Pour un dépôt anonyme sans participant déjà connu, `participantToken` est également renvoyé afin que le front puisse le transmettre au parcours puis à la mutation GraphQL. Il n’est pas renvoyé pour un utilisateur connecté.

Exemple :

```php
return $this->json([
    'vocalId' => GlobalId::toGlobalId('VocalContribution', $vocalContribution->getId()),
], Response::HTTP_CREATED);
```

### 8.4 Traitement cible

Le contrôleur doit exécuter les opérations dans cet ordre :

1. vérifier le feature flag global ;
2. récupérer le fichier ;
3. vérifier le type et la taille ;
4. extraire et vérifier la durée côté serveur ;
5. résoudre le contributeur courant ;
6. créer le `Media` privé ;
7. créer `VocalContribution` avec `media` et propriétaire ;
8. initialiser le statut à `MISSING_REQUIREMENTS` ;
9. persister de manière atomique ;
10. retourner `vocalId`.

Exemple de structure :

```php
public function upload(Request $request): JsonResponse
{
    $this->assertFeatureEnabled();
    $file = $this->uploadedFileExtractor->getRequiredFile($request, 'file');
    $duration = $this->vocalFileValidator->validate($file);
    $contributor = $this->contributorResolver->resolve($request);

    $this->entityManager->beginTransaction();
    try {
        $media = $this->mediaManager->createVocalFile($file, $duration, flush: false);

        $contribution = (new VocalContribution())
            ->setMedia($media)
            ->setContributor($contributor)
            ->setMissingRequirementsStatus();

        $this->entityManager->persist($contribution);
        $this->entityManager->flush();
        $this->entityManager->commit();
    } catch (\Throwable $exception) {
        $this->entityManager->rollback();
        $this->privateMediaStorage->remove($media ?? null);
        throw $exception;
    }

    return $this->json([
        'vocalId' => $this->globalIdEncoder->encode($contribution),
    ], Response::HTTP_CREATED);
}
```

Le code réel doit éviter de laisser un fichier privé orphelin si l’écriture SQL échoue. La méthode actuelle `MediaManager::createFileFromUploadedFile()` effectue un `flush()` immédiat ; il faut soit lui ajouter un mode sans flush, soit créer un chemin dédié pour conserver l’opération atomique.

### 8.5 Codes d’erreur HTTP

| Code | Cas |
|---:|---|
| `400` | Champ fichier absent, fichier vide ou requête invalide |
| `403` | Feature désactivée, CSRF invalide ou accès refusé |
| `404` | Aucune étape vocal configurée |
| `413` | Fichier trop volumineux |
| `415` | Type MIME non audio autorisé |
| `422` | Durée inférieure à 10 secondes ou supérieure à 180 secondes |
| `500` | Échec de stockage ou de persistance |

## 9. Validation du fichier audio

### 9.1 Validation de confiance

Les informations envoyées par le navigateur ne sont pas suffisantes pour valider la durée ou le type du fichier.

Le backend doit vérifier :

- `UploadedFile::isValid()` ;
- présence et taille non nulle ;
- MIME détecté côté serveur ;
- type audio autorisé ;
- taille maximale ;
- durée réelle du flux audio.

Les contenus vidéo ne doivent pas être acceptés, même si le conteneur contient aussi une piste audio.

Le MIME détecté côté serveur (`finfo`) ne suffit pas à les distinguer : un WebM ou un MP4 audio seul enregistré par le navigateur (`MediaRecorder`) est détecté comme `video/webm` ou `video/mp4`. La liste autorisée inclut donc ces deux types, et `VocalContributionDurationResolver` refuse tout fichier qui contient un flux vidéo ou aucun flux audio :

```php
$this->mediaManager->validateUploadedFile($file, [
    'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'video/webm', 'video/mp4',
]);
```

### 9.2 Durée

Le backend utilise `ffprobe`, disponible dans l’image applicative, pour lire la
durée côté serveur. Le client ne doit jamais fournir une durée considérée comme
fiable.

Le processus est limité à 3 secondes afin de ne pas bloquer durablement la
requête synchrone. En cas de timeout uniquement, le fichier peut être accepté si
les contrôles Symfony, de taille et de MIME ont déjà réussi ; la durée du média
reste alors inconnue. Une erreur explicite de `ffprobe` ou l’absence de flux audio
reste un rejet.

Exemple d’interface attendue :

```php
final class VocalDurationExtractor
{
    public function extract(UploadedFile $file): ?float
    {
        // Return null when the parser exceeds the request time budget.
    }
}
```

Règles :

```php
if (null !== $duration && $duration < 10) {
    throw new VocalValidationException('Vocal is shorter than 10 seconds.');
}

if (null !== $duration && $duration > 180) {
    throw new VocalValidationException('Vocal is longer than 3 minutes.');
}
```

Le front arrête l’enregistrement à 180 secondes pour l’expérience utilisateur, mais seul le backend fait foi.

La durée est lue avec `ffprobe` (paquet `ffmpeg` de l’image applicative). Un WebM produit par `MediaRecorder` n’a pas de durée dans son en-tête (`ffprobe` renvoie `N/A`) : la durée retenue est alors la fin du dernier paquet audio.

Le front mesure la durée avec une horloge, et l’audio encodé peut s’en écarter de quelques centièmes de seconde. Le backend applique donc une tolérance d’une seconde sur les deux bornes, pour ne pas refuser un vocal arrêté automatiquement à 3 minutes.

### 9.3 Antivirus

L’antivirus n’est pas branché dans cette première version. Le point d’extension devra rester dans le service d’upload afin de pouvoir ajouter ultérieurement :

```php
// Future extension point: scan the private temporary file before persistence.
```

## 10. Stockage privé dans `media__media`

### 10.1 Métadonnées du média

Le média est créé via `MediaManager` avec un contexte dédié :

```php
public const VOCAL_CONTEXT = 'vocal_contribution';
```

Il doit avoir :

- un nom serveur généré aléatoirement ;
- un MIME audio détecté côté serveur ;
- la taille réelle ;
- la durée ;
- le contexte `vocal_contribution` ;
- le marqueur de confidentialité `private_attachment=1` ou une protection équivalente.

Ne jamais utiliser le nom original pour construire le chemin serveur.

### 10.2 Fichier hors filesystem public

Le `MediaProvider` actuel écrit les médias génériques dans le filesystem public. Le contexte `vocal_contribution` doit utiliser un chemin privé, par exemple :

```text
var/vocal-contributions/<providerReference>
```

Le chemin doit être construit côté serveur à partir de `providerReference` et sécurisé avec `basename()` ou une validation stricte de l’identifiant.

Le lecteur générique `/media/...` ne doit pas pouvoir servir ce contexte. Une tentative de lecture générique doit retourner `404` ou `403`.

Le contrôle de taille cumulée appliqué aux uploads doit également couvrir `var/vocal-contributions`. Il réutilise la même limite configurée que le dossier média générique (`SYMFONY_MAX_MEDIA_FOLDER_SIZE`) et bloque l’upload lorsque cette limite est dépassée.

### 10.3 Route de réécoute BO

Reprendre la route dédiée du POC :

```text
GET /admin/voice-messages/{vocalId}/file
```

Le contrat cible utilise le global ID de `VocalContribution`. La route accepte aussi les global IDs ou IDs bruts de `Media` pendant la transition avec le POC BO, puis vérifie systématiquement la relation avec un `VocalContribution` de contexte `vocal_contribution`.

Contrôles obligatoires :

1. `ROLE_ADMIN` ;
2. identifiant de `VocalContribution` valide ;
3. relation avec un `Media` de contexte `vocal_contribution` ;
4. fichier privé existant ;
5. chemin résolu sans traversée de répertoire.

Réponse recommandée :

```php
$response = new BinaryFileResponse($path);
$response->headers->set('Content-Type', $media->getContentType() ?? 'application/octet-stream');
$filename = $this->vocalContributionFilename($vocalContribution, $extension);
$response->headers->set('Content-Disposition', 'inline; filename="' . $filename . '"');
$response->headers->set('Cache-Control', 'private, no-store');
$response->headers->set('X-Content-Type-Options', 'nosniff');

return $response;
```

Le paramètre `download=1` peut déclencher `attachment` si le BO doit proposer un téléchargement.

## 11. Rate limiting

> **Désactivé temporairement.** `RateLimiter::canDoAction()` n’enregistre une expiration qu’au premier appel : les incréments suivants sont sauvegardés sans expiration, et la fenêtre de 15 minutes est perdue. Le contrôle est retiré de `VocalContributionUploadService` (voir le TODO) jusqu’à la correction du `RateLimiter`.

Le rate limiting s’applique à la route REST d’upload, avant l’écriture du fichier.

Valeurs initiales :

- 5 tentatives par 15 minutes par IP ;
- 5 tentatives par 15 minutes par session ;
- aucune limite métier sur le nombre total de vocaux d’un participant.

Le projet possède déjà un `Capco\AppBundle\Security\RateLimiter` basé sur Redis. Son comportement actuel est orienté fenêtre d’une minute ; il faut l’étendre proprement ou ajouter un service vocal spécialisé pour supporter une fenêtre de 15 minutes.

Exemple de clé :

```php
$ipKey = 'vocal-upload-ip-' . hash('sha256', $request->getClientIp() ?? 'unknown');
$sessionKey = 'vocal-upload-session-' . $request->getSession()->getId();
```

Ne jamais utiliser une clé contenant directement une donnée sensible non normalisée.

La mutation GraphQL ne doit pas consommer une nouvelle unité de quota : elle finalise un upload déjà limité.

Réponse attendue en cas de dépassement : `429 Too Many Requests`, avec éventuellement `Retry-After`.

## 12. `AddVocalContributionMutation`

### 12.1 Rôle

La mutation ne reçoit pas le fichier. Elle prend le `vocalId` retourné par la route REST, vérifie son propriétaire, rattache le participant si nécessaire, évalue les requirements et indique au front s’il doit ouvrir le parcours.

### 12.2 Input GraphQL

Fichier : `AddVocalContributionInput.types.yaml`

```yaml
AddVocalContributionInput:
    type: relay-mutation-input
    config:
        description: 'Finalize the initial submission of a vocal contribution.'
        fields:
            vocalId:
                type: 'ID!'
                description: 'The VocalContribution global ID returned by the upload route.'
            participantToken:
                type: 'String'
                description: 'The anonymous participant token.'
```

### 12.3 Payload GraphQL

Fichier : `AddVocalContributionPayload.types.yaml`

```yaml
AddVocalContributionPayload:
    type: relay-mutation-payload
    config:
        fields:
            contributionId:
                type: 'ID!'
                description: 'The VocalContribution global ID.'
            shouldTriggerParticipationWorkflow:
                type: 'Boolean!'
                description: 'Whether the front must open the requirements workflow.'
            shouldTriggerConsentInternalCommunication:
                type: 'Boolean!'
                description: 'Whether the optional consent prompt must be displayed.'
            completionStatus:
                type: 'ContributionCompletionStatus!'
```

Les deux indicateurs sont calculés par le backend. Le client ne doit pas pouvoir les forcer.

Ils ont des significations différentes :

- `shouldTriggerParticipationWorkflow` vaut `true` uniquement si les requirements obligatoires de l’étape ne sont pas remplis ;
- `shouldTriggerConsentInternalCommunication` vaut `true` si le consentement facultatif n’a jamais été accepté, indépendamment des requirements de l’étape.

Le front peut donc devoir afficher uniquement le consentement lorsque l’étape ne comporte aucun requirement, puis considérer le vocal comme terminé si l’utilisateur refuse ce consentement.

### 12.4 Déclaration dans `InternalMutation.types.yaml`

```yaml
addVocalContribution:
    access: "hasFeatureFlag('vocal_contribution')"
    builder: 'Relay::Mutation'
    builderConfig:
        inputType: AddVocalContributionInput
        payloadType: AddVocalContributionPayload
        mutateAndGetPayload: '@=mutation("Capco\\AppBundle\\GraphQL\\Mutation\\AddVocalContributionMutation", args, getUser())'
```

La mutation est accessible aux anonymes lorsque le feature flag est actif. L’autorisation métier est effectuée dans la classe de mutation.

### 12.5 Algorithme

```php
public function __invoke(Argument $input, ?User $viewer = null): array
{
    $this->formatInput($input);

    $vocal = $this->resolveVocal($input->offsetGet('vocalId'));
    $participant = $this->resolveParticipant($input->offsetGet('participantToken'));
    $contributor = $viewer ?? $participant;

    $this->assertVocalCanBeUsedBy($vocal, $contributor);
    $this->assertVocalIsMutable($vocal);

    $step = $this->collectStepRepository->findVocalContributionStep();
    if (!$step) {
        throw new UserError('No vocal contribution step is configured.');
    }
    $meetsRequirements = $this->meetsRequirements($contributor, $step, $viewer);
    $shouldTriggerConsent = !$contributor->isConsentInternalCommunication();

    if ($contributor instanceof User) {
        $vocal->setUser($contributor);
    } else {
        $vocal->setParticipant($participant);
    }

    if ($meetsRequirements) {
        $vocal->setCompletedStatus();
    } else {
        $vocal->setMissingRequirementsStatus();
    }

    $this->em->flush();

    return [
        'contributionId' => $vocal,
        'shouldTriggerParticipationWorkflow' => !$meetsRequirements,
        'shouldTriggerConsentInternalCommunication' => $shouldTriggerConsent,
        'completionStatus' => $vocal->getCompletionStatus(),
    ];
}
```

Pour l’évaluation, réutiliser :

- `ViewerIsMeetingRequirementsResolver` pour un utilisateur connecté ;
- `ParticipantIsMeetingRequirementsResolver` pour un participant anonyme.

Ne pas dupliquer la logique des requirements dans `AddVocalContributionMutation`.

Pour le consentement facultatif, réutiliser la propriété existante du contributeur (`isConsentInternalCommunication()`) et le parcours existant qui enregistre le choix. Ne pas ajouter le consentement aux requirements de `CollectStep` : il est demandé même si aucune information n’est configurée sur l’étape.

### 12.6 Contrôles d’accès

La résolution du vocal doit refuser :

- un global ID d’un autre type ;
- un vocal inexistant ;
- un vocal déjà rattaché à un autre propriétaire ;
- un vocal déjà `COMPLETED` ;
- un participant token qui ne correspond pas au participant propriétaire ;
- un média de contexte différent de `vocal_contribution`.

Un identifiant global n’est pas une preuve de propriété.

## 13. Finalisation du parcours de requirements

### 13.1 Réutilisation de `ValidateContributionMutation`

Le dépôt contient déjà `ValidateContributionMutation`, qui utilise les resolvers de requirements et passe les contributions à `COMPLETED`.

Le vocal ne doit pas être forcé dans `ContributionInterface`, car cette interface
suppose que l’étape soit récupérable depuis l’entité. La validation doit donc
traiter explicitement `VocalContribution` ou déléguer à un service vocal dédié,
qui résout l’étape avec `CollectStepRepository::findVocalContributionStep()`.
Elle doit réutiliser les mêmes resolvers de requirements et le même transfert
vers l’utilisateur que le parcours existant, sans créer de proposition :

```php
private function getVocalContributionStep(): CollectStep
{
    $step = $this->collectStepRepository->findVocalContributionStep();
    if (!$step) {
        throw new UserError('No vocal contribution step is configured.');
    }

    return $step;
}
```

La méthode générique doit ensuite :

1. résoudre l’utilisateur ou le participant ;
2. vérifier les requirements de l’étape ;
3. refuser la validation si un requirement obligatoire manque encore ;
4. ne pas bloquer la validation si le consentement facultatif est refusé ;
5. appeler `setCompletedStatus()` ;
6. flusher la contribution ;
7. retourner la redirection vers la page d’accueil.

Le consentement est traité dans son propre parcours. Son absence ne doit pas maintenir la contribution à `MISSING_REQUIREMENTS`.

`VocalContribution` ne doit déclencher aucune logique propre aux propositions, à l’indexation des propositions ou aux compteurs de propositions.

### 13.2 Identifiant transmis au workflow

Le `contributionId` retourné par `AddVocalContributionMutation` doit être propagé au workflow existant.

Le parcours doit appeler la validation avec cet identifiant. Il ne faut pas déduire le vocal uniquement à partir du participant, car un participant peut déposer plusieurs vocaux.

### 13.3 Redirection

Après validation, la réponse doit permettre au front de revenir à la page d’accueil. La redirection peut réutiliser le mécanisme existant de `ValidateContributionMutation`, avec une URL d’accueil plutôt qu’une URL de contribution textuelle.

## 14. Query BO `vocals`

### 14.1 Type GraphQL

Fichier : `InternalVocalContribution.types.yaml`

```yaml
InternalVocalContribution:
    type: object
    config:
        name: VocalContribution
        interfaces:
            - Node
        fields:
            id:
                type: 'ID!'
                builder: 'Relay::GlobalId'
                builderConfig:
                    typeName: VocalContribution
            completionStatus:
                type: 'ContributionCompletionStatus!'
            file:
                type: 'ID!'
                description: 'The protected Media global ID used by the BO.'
                resolve: '@=query("Capco\\AppBundle\\GraphQL\\Resolver\\VocalContribution\\VocalContributionMediaIdResolver", value)'
            user:
                type: 'InternalUser'
            participant:
                type: 'InternalParticipant'
            createdAt:
                type: 'DateTime!'
```

Ne pas exposer le champ `url` générique de `InternalMedia` au front public. La réécoute BO doit passer par une route admin protégée.

### 14.2 Connexion

Fichier : `InternalVocalContributionConnection.types.yaml`

```yaml
InternalVocalContributionConnection:
    type: relay-connection
    config:
        name: VocalContributionConnection
        nodeType: InternalVocalContribution!
        connectionFields:
            totalCount:
                type: Int!
```

### 14.3 Query racine

Dans `InternalQuery.types.yaml` :

```yaml
vocals:
    type: 'InternalVocalContributionConnection!'
    access: "@=hasRole('ROLE_ADMIN') and hasFeatureFlag('vocal_contribution')"
    argsBuilder: 'Relay::ForwardConnection'
    args:
        status:
            type: 'ContributionCompletionStatus'
    resolve: '@=query("Capco\\AppBundle\\GraphQL\\Resolver\\VocalContribution\\VocalContributionConnectionResolver", args, getUser())'
```

La Query doit être paginée. Ne pas charger tous les vocaux en mémoire.

### 14.4 Repository

Le repository doit proposer une requête paginée avec :

- tri par `created_at DESC`, puis `id DESC` pour stabiliser la pagination ;
- filtre facultatif par statut ;
- jointures contrôlées sur `user`, `participant`, `media` ;
- compteur cohérent avec les mêmes filtres.

Exemple :

```php
public function findForAdmin(
    ?string $status,
    int $offset,
    int $limit
): array {
    $qb = $this->createQueryBuilder('v')
        ->leftJoin('v.user', 'u')->addSelect('u')
        ->leftJoin('v.participant', 'p')->addSelect('p')
        ->leftJoin('v.media', 'm')->addSelect('m')
        ->orderBy('v.createdAt', 'DESC')
        ->addOrderBy('v.id', 'DESC')
        ->setFirstResult($offset)
        ->setMaxResults($limit);

    if (null !== $status) {
        $qb->andWhere('v.completionStatus = :status')
            ->setParameter('status', $status);
    }

    return $qb->getQuery()->getResult();
}
```

### 14.5 Filtre Doctrine des contributions

Le filtre `ContributionCompletionStatusFilter` ne doit pas masquer les `MISSING_REQUIREMENTS` dans la Query BO.

Deux solutions acceptables :

1. ne pas inclure `VocalContribution` dans le filtre global et filtrer explicitement les contextes qui en ont besoin ;
2. désactiver le filtre uniquement autour de la requête BO, puis le réactiver dans un `finally`.

Exemple de protection contre les effets de bord :

```php
$filters = $this->em->getFilters();
$wasEnabled = $filters->isEnabled(ContributionCompletionStatusFilter::FILTER_NAME);

if ($wasEnabled) {
    $filters->disable(ContributionCompletionStatusFilter::FILTER_NAME);
}

try {
    return $this->repository->findForAdmin($status, $offset, $limit);
} finally {
    if ($wasEnabled) {
        $filters->enable(ContributionCompletionStatusFilter::FILTER_NAME);
    }
}
```

Le choix doit être documenté dans le resolver pour éviter qu’une désactivation globale ne rende d’autres contributions visibles par erreur.

## 15. Réconciliation participant / utilisateur

### 15.1 Service

Créer `VocalContributionReconcilier` sur le modèle de `ReplyReconcilier` et `ProposalReconcillier`.

Responsabilités :

- rechercher les vocaux du participant source, quel que soit leur statut ;
- vérifier que l’étape est encore compatible avec la réconciliation selon les conventions existantes ;
- transférer le propriétaire vers l’utilisateur ou le participant cible ;
- ne pas modifier le média ;
- ne pas changer le statut ;
- flusher une seule fois à la fin.

Exemple :

```php
final class VocalContributionReconcilier extends ContributionsReconcilier
{
    public function __construct(
        EntityManagerInterface $em,
        private readonly VocalContributionRepository $repository
    ) {
        parent::__construct($em);
    }

    public function reconcile(
        Participant $participant,
        ContributorInterface $target
    ): void {
        $this->disableCompletionStatusFilter();

        foreach ($this->repository->findBy(['participant' => $participant]) as $vocal) {
            $vocal->setContributor($target);
        }

        $this->em->flush();
    }
}
```

La règle exacte de conservation de `participant_id` lors d’un rattachement à `user_id` doit rester alignée avec les autres contributions.

### 15.2 Branchement

Injecter le reconciler dans `VerifyParticipantPhoneNumberMutation` et l’appeler avec les autres :

```php
private function reconcileParticipantContributions(
    Participant $participant,
    ContributorInterface $target
): void {
    $this->replyReconcilier->reconcile($participant, $target);
    $this->proposalReconcillier->reconcile($participant, $target);
    $this->votesReconcilier->reconcile($participant, $target);
    $this->vocalContributionReconcilier->reconcile($participant, $target);
}
```

Le transfert doit aussi être exécuté lorsque la réconciliation produit directement une authentification utilisateur, si ce chemin ne passe pas déjà par le même service commun.

## 16. Sécurité

### 16.1 Upload

- feature flag vérifié côté serveur ;
- CSRF vérifié sur la route REST ;
- MIME détecté côté serveur ;
- durée calculée côté serveur ;
- types vidéo refusés ;
- nom de fichier serveur aléatoire ;
- aucun chemin fourni ou accepté depuis le client ;
- aucune confiance dans `vocalId` pour autoriser une action.

### 16.2 Propriété de la contribution

Le serveur doit comparer le vocal avec :

- l’utilisateur connecté ; ou
- le participant résolu par la session/token.

Un participant token transmis dans une requête ne doit jamais suffire à accéder à un vocal qui appartient déjà à un autre participant.

### 16.3 Média

- le fichier reste hors du filesystem public ;
- le contexte du média est vérifié avant lecture ;
- la route de lecture exige `ROLE_ADMIN` ;
- les réponses de fichier utilisent `private, no-store` ;
- ajouter `X-Content-Type-Options: nosniff` ;
- ne jamais renvoyer de chemin absolu ni de chemin de provider ;
- ne pas exposer `InternalMedia.url` au public pour ce contexte.

### 16.4 BO et GraphQL

- `vocals` exige `ROLE_ADMIN` ;
- le type GraphQL ne doit pas être accessible par une Query publique ;
- les champs `user` et `participant` ne sont exposés qu’au BO ;
- un global ID de vocal ne doit pas permettre une lecture publique ;
- le filtre de statut ne doit accepter que l’enum connu.

### 16.5 Données personnelles

Le BO peut afficher les informations nécessaires à l’identification du déposant, notamment l’e-mail de l’utilisateur ou du participant. L’accès doit rester limité aux administrateurs habilités.

## 17. Administration du feature flag et du BO

### 17.1 Feature page

Vérifier les trois niveaux :

1. le flag est connu du `Toggle\Manager` ;
2. il est activable par un super administrateur ;
3. il apparaît dans `FeatureItems.json` sous « Autres ».

Ajouter les traductions correspondantes.

### 17.2 Liste BO

Conserver la route de navigation utilisée par le POC :

```text
GET /admin/voice-messages              -> redirection vers /admin-next/voice-messages
GET /admin-next/voice-messages          -> page admin-next
```

La liste BO est alimentée par la Query GraphQL `vocals`, qui applique les règles
d’accès, la pagination et le filtre par statut prévus par le contrat BO.

La liste doit afficher :

- statut ;
- date ;
- utilisateur si connu ;
- participant si anonyme ;
- bouton de lecture ;
- pagination ;
- filtre facultatif par statut.

Les contributions `MISSING_REQUIREMENTS` doivent être affichées avec une mention explicite des requirements non finalisés.

Il n’y a pas de Query utilisateur pour ses propres vocaux.

### 17.3 Exports BO

Chaque ligne de la liste doit proposer un bouton de téléchargement du vocal concerné.

La page doit également proposer un bouton d’export global. Dans le périmètre initial, cet export ne comporte aucun filtre de période : il contient tous les vocaux accessibles dans la liste au moment de la génération, y compris les statuts `COMPLETED` et `MISSING_REQUIREMENTS`, et produit un ZIP nommé :

```text
vocals_YYYY-MM-DD.zip
```

La date est celle du jour de génération de l’archive, dans le fuseau horaire applicatif.

Chaque fichier audio contenu dans l’archive respecte le nommage suivant :

```text
{id_contrib}.{extension}
```

Règles de génération du nom :

- utiliser l’identifiant interne stable de `VocalContribution` pour `id_contrib` ;
- dériver l’extension du type MIME ou de l’extension normalisée du média, jamais directement du nom fourni par le client ;
- ne jamais inclure l’adresse e-mail ou une autre donnée personnelle dans le nom du fichier ;
- l’identifiant de contribution rend chaque nom unique.

Le périmètre de l’export doit être construit avec le même contrôle d’accès que la Query BO. Un utilisateur non administrateur ne peut ni appeler l’export individuel ni l’export global.

Route reprise du POC pour le téléchargement individuel :

```text
GET /admin/voice-messages/{vocalId}/file?download=1
```

Cette route réutilise la lecture protégée du POC et force le téléchargement avec le nom calculé.

Aucune route d’export global n’est présente dans le commit du POC. La route retenue est `/export-voice-messages`; elle devra être ajoutée dans le contrôleur d’export existant, selon la convention des routes `/export-project-contributors/{projectId}` et `/export-step-contributors/{stepId}`.

L’export global reprend la convention des exports existants de projet (`ExportController`, génération à la demande, fichier dans le répertoire d’export, réponse de téléchargement contrôlée) au lieu d’introduire un mécanisme d’export spécifique aux vocaux.

Cette route devra générer une archive ZIP à partir des médias autorisés et forcer le téléchargement avec le nom `vocals_{date_du_jour}.zip`.

La génération doit utiliser le mécanisme d’export à la demande déjà présent (`ExportOnDemandManager` et commande dédiée) afin de conserver le comportement existant lorsque l’export dépasse le délai de génération synchrone. Le fichier est généré dans le répertoire d’export configuré et servi par le contrôleur après vérification de l’autorisation.

La commande d’export lit les fichiers depuis leur stockage privé, sans rendre le répertoire privé public. Les médias absents ou illisibles doivent provoquer une erreur explicite plutôt qu’une archive silencieusement incomplète.

Les réponses d’export doivent rester privées et inclure au minimum `Content-Disposition: attachment`, `Cache-Control: private, no-store` et `X-Content-Type-Options: nosniff`.

## 18. Tests à écrire

Les scénarios ci-dessous doivent être couverts par le type de test le plus pertinent, au cas par cas :

- **PHPUnit** pour les entités, services, contrôleurs Symfony, règles métier, sécurité, stockage, exports et réconciliation ;
- **Jest** pour les composants et comportements isolés du front ou de l’admin-next, ainsi que les contrats GraphQL lorsqu’un test Jest est adapté ;
- **Cypress** pour les parcours de bout en bout dans le navigateur : enregistrement, soumission, ouverture conditionnelle du parcours, validation, réécoute et téléchargement depuis le BO.

Un scénario ne doit pas être systématiquement dupliqué dans les trois frameworks. Le choix doit couvrir le risque principal du scénario et rester cohérent avec les stratégies de test existantes du projet.

### 18.1 Entité et repository

- statut par défaut ;
- passage à `MISSING_REQUIREMENTS` ;
- passage à `COMPLETED` ;
- relation unique avec `Media` ;
- recherche par statut ;
- pagination et ordre stable ;
- filtrage BO incluant les deux statuts.

### 18.2 Route REST

Tester au minimum :

- feature flag désactivé ;
- aucune étape vocal configurée ;
- fichier absent ;
- fichier vide ;
- MIME non audio ;
- conteneur vidéo ;
- taille dépassée ;
- durée inférieure à 10 secondes ;
- durée supérieure à 180 secondes ;
- fichier valide anonyme ;
- fichier valide connecté ;
- création du média dans `media__media` ;
- création du `VocalContribution` ;
- retour d’un `vocalId` global ;
- rollback et nettoyage si la persistance échoue ;
- absence d’exposition du chemin physique.

### 18.3 Mutation GraphQL

- vocal inexistant ;
- global ID d’un autre type ;
- vocal appartenant à un autre participant ;
- vocal déjà `COMPLETED` ;
- utilisateur connecté satisfaisant les requirements ;
- utilisateur connecté ne les satisfaisant pas ;
- participant satisfaisant les requirements ;
- participant ne les satisfaisant pas ;
- étape sans requirements ;
- payload avec `shouldTriggerParticipationWorkflow` correct ;
- consentement déjà accepté : `shouldTriggerConsentInternalCommunication = false` ;
- consentement non accepté avec requirements absents : consentement demandé, vocal `COMPLETED` ;
- consentement refusé : vocal `COMPLETED` et parcours non bloqué ;
- consentement accepté par un participant anonyme lors d’une participation précédente : consentement non redemandé ;
- statut non modifiable par le client ;
- feature flag désactivé.

### 18.4 Validation du parcours

- `ValidateContributionMutation` accepte un `VocalContribution` ;
- un participant non conforme est refusé ;
- un utilisateur non conforme est refusé ;
- un vocal conforme passe à `COMPLETED` ;
- aucune proposition n’est créée ;
- aucune indexation de proposition n’est déclenchée ;
- la redirection finale est la home ;
- le bon `contributionId` est utilisé lorsqu’un participant a plusieurs vocaux.

### 18.5 Réconciliation

- participant vers utilisateur ;
- participant vers participant ;
- vocal `MISSING_REQUIREMENTS` ;
- vocal `COMPLETED` ;
- plusieurs vocaux pour un participant ;
- le média reste inchangé ;
- le statut reste inchangé ;
- le participant source ne laisse pas un vocal inaccessible.

### 18.6 Query et accès BO

- administrateur autorisé ;
- utilisateur non administrateur refusé ;
- anonymes refusés ;
- retour des deux statuts ;
- filtre par statut ;
- pagination ;
- informations user/participant correctes ;
- lecture du fichier autorisée pour un admin ;
- lecture refusée pour un utilisateur standard ;
- chemin inexistant ;
- média d’un autre contexte refusé.

### 18.7 Exports BO

- téléchargement individuel autorisé pour un administrateur ;
- téléchargement individuel refusé pour un utilisateur non administrateur ;
- nom individuel basé uniquement sur l’identifiant de contribution ;
- extension dérivée du média ;
- export global contenant les deux statuts ;
- nom du ZIP au format `vocals_YYYY-MM-DD.zip` ;
- route d’export globale alignée sur le mécanisme `ExportController` / `ExportOnDemandManager` ;
- export global refusé sans rôle administrateur ;
- noms uniques dans le ZIP pour plusieurs vocaux d’un même déposant ;
- média absent ou illisible traité explicitement ;
- suppression du fichier temporaire après génération.

### 18.8 Tests frontend

Lorsque le front sera raccordé :

- affichage du bouton selon le feature flag ;
- compteur de 3 minutes ;
- arrêt automatique ;
- refus visuel d’un vocal de moins de 10 secondes ;
- réécoute ;
- recommencer ;
- appel REST puis mutation ;
- ouverture conditionnelle du workflow ;
- retour à la home après validation ;
- fonctionnement mobile.

## 19. Migration et déploiement

Ordre recommandé :

1. ajouter le feature flag désactivé ;
2. appliquer la migration `collect_step` et `vocal_contribution` ;
3. déployer le stockage privé et le lecteur admin ;
4. déployer les validations et la route REST ;
5. déployer GraphQL et la réconciliation ;
6. déployer le BO ;
7. vérifier les tests et le schéma GraphQL ;
8. activer le flag sur l’instance ;
9. activer le champ sur l’unique `CollectStep` du projet.

La migration doit être réversible autant que possible. Comme aucun ancien vocal métier n’existe dans le périmètre, aucune migration de données n’est attendue.

Vérifications de déploiement :

- le répertoire privé existe et est inscriptible par l’application ;
- il n’est pas servi par nginx ;
- les fichiers survivent au redémarrage si la persistance est nécessaire ;
- le BO peut lire un fichier avec un compte admin ;
- un utilisateur standard reçoit `403` ;
- la Query GraphQL est absente lorsque le flag est désactivé ;
- le projet possède bien une seule étape activée.

## 20. Points volontairement hors périmètre

- analyse antivirus ;
- transcription et correction de transcription ;
- suppression utilisateur ;
- nettoyage automatique des `MISSING_REQUIREMENTS` ;
- recherche Elasticsearch ;
- notifications e-mail ;
- limite métier du nombre de vocaux.

## 21. Points à vérifier avant développement

1. Choisir le parseur de durée audio disponible dans l’image applicative.
2. Confirmer que 10 MiB convient à tous les formats audio ciblés.
3. Confirmer la convention exacte de conservation de `participant_id` après rattachement à `user_id`.
4. Vérifier si le parcours existant peut recevoir un `VocalContribution` via `ValidateContributionMutation` sans introduire de proposition.
5. Vérifier la persistance du répertoire privé en production.
6. Vérifier la stratégie de restauration et de sauvegarde des médias vocaux.

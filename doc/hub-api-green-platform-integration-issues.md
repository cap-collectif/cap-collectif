# Intégration Platform — Hub API Green

## Étape de cadrage — Figer le contrat Hub, `fileType` et Platform

Cette étape n'est pas une issue d'implémentation et ne produit pas de commit
applicatif. Elle sert à valider le contrat utilisé par les issues suivantes.

- documenter le JSON réel du Hub, avec `type`/`fileType` porté par le document et transmis à ses fichiers ;
- documenter le référentiel des codes, libellés et catégories, sans inventer la catégorie d'un code absent du référentiel ;
- valider que `fileType` est un code numérique APIGREEN sur trois chiffres (`000`, `003`, `041`) ;
- figer les dates au format `YYYY-MM-DD HH:MM:SS` pour Platform ;
- figer `filesize` APIGREEN en Ko et la conversion `sizeBytes = filesize * 1024` vers `media__media.content_size` ;
- documenter l'appel `POST https://{instance_url}/graphql/internal` et la clé commune utilisée par le Hub pour cet appel ;
- documenter la clé distincte par instance utilisée par Platform pour appeler l'API Hub ;
- valider la mutation et le payload GraphQL de référence ci-dessous.

Endpoint :

```text
POST https://{instance_url}/graphql/internal
```

Mutation :

```graphql
mutation SynchronizeHubApiGreenMedia($input: SynchronizeHubApiGreenMediaInput!) {
  synchronizeHubApiGreenMedia(input: $input) {
    stepId
    aiotCode
    folderNumber
    synchronizedAt
    errorCode
  }
}
```

Payload :

```json
{
  "query": "mutation SynchronizeHubApiGreenMedia($input: SynchronizeHubApiGreenMediaInput!) { synchronizeHubApiGreenMedia(input: $input) { stepId aiotCode folderNumber synchronizedAt errorCode } }",
  "variables": {
    "input": {
      "stepId": "step-id-platform",
      "aiotCode": "code-aiot",
      "folderNumber": "T0603151600",
      "documents": [
        {
          "documentId": 16233,
          "documentVersion": 1,
          "documentName": "fichierJustificatifMaitriseFonciere.pdf",
          "documentLabel": "Justificatif de maîtrise foncière",
          "s3Path": "s3://hub-api-green/step-id-platform/T0603151600/16233/1/MaitriseFoncere.pdf",
          "fileId": 15840,
          "fileVersion": 1,
          "filename": "MaitriseFoncere.pdf",
          "mimeType": "application/pdf",
          "sizeBytes": 526504960,
          "checksum": "0kmHp0VSyBvmVAhTVoRyMZfkyeF3Mdkv9DNAqFhCRzE=",
          "creationDate": "2026-06-03 15:21:38",
          "lastUpdate": "2026-06-03 15:21:38",
          "classification": {
            "fileType": "004",
            "documentTypeCode": "JUSTFONC",
            "documentTypeLabel": "Justificatif de maîtrise foncière",
            "category": null
          }
        }
      ]
    }
  }
}
```

## Appeler Platform depuis l'extérieur

La synchronisation est exposée par une requête `POST` vers l'endpoint GraphQL
interne de l'instance Platform :

```text
https://{platform_instance_url}/graphql/internal
```

L'appel doit fournir la clé Hub → Platform dans l'en-tête HTTP `Authorization` :

```http
Authorization: Bearer {hub_to_platform_api_key}
Content-Type: application/json
```

La clé est une donnée secrète. Elle ne doit être ni placée dans l'URL, ni
écrite dans les logs, ni envoyée dans le payload GraphQL. Elle doit être liée à
un utilisateur Platform disposant de `ROLE_ADMIN`, car la mutation est protégée
par ce rôle.

Exemple d'appel :

```bash
curl --fail-with-body --request POST \
  --url 'https://{platform_instance_url}/graphql/internal' \
  --header 'Authorization: Bearer {hub_to_platform_api_key}' \
  --header 'Content-Type: application/json' \
  --data @synchronize-hub-api-green-media.json
```

Le fichier `synchronize-hub-api-green-media.json` reprend le payload présenté
ci-dessus, avec les valeurs réelles de l'instance Platform.

Pour un appel réel, `documents` doit contenir le snapshot des documents à
synchroniser. `stepId` doit correspondre à un step existant dans Platform et
`s3Path` doit être une URI S3 placée directement dans chaque document. Platform
enregistre automatiquement `source: hub-api-green` et `storage: s3` dans les
métadonnées du média.


Platform valide que le bucket de `s3Path` correspond à
`SYMFONY_HUB_API_GREEN_S3_BUCKET`. Pour publier le document dans le
`stepBody`, Platform conserve la clé de l'objet et remplace `s3://{bucket}` par
la base publique configurée dans `SYMFONY_HUB_API_GREEN_S3_PUBLIC_URL`. Le
bucket Scaleway et ses objets doivent donc être accessibles publiquement.

La mutation peut répondre avec un statut HTTP `200` même lorsqu'une erreur
fonctionnelle est détectée. Il faut donc toujours lire `errorCode` :

```json
{
  "data": {
    "synchronizeHubApiGreenMedia": {
      "stepId": "{real_platform_step_id}",
      "aiotCode": "{aiot_code}",
      "folderNumber": "{folder_number}",
      "synchronizedAt": "2026-06-03T15:21:38+00:00",
      "errorCode": null
    }
  }
}
```

Les erreurs d'authentification (`401` ou `403`) et les erreurs GraphQL de
transport doivent être traitées comme des erreurs techniques et peuvent être
retentées selon la politique du Hub. Une réponse `200` avec un `errorCode`
non nul correspond à une erreur fonctionnelle et doit être journalisée sans
la clé API ni le contenu des fichiers.

Le firewall API key et son authenticator couvrent `/graphql/internal`. La clé
est donc résolue comme un utilisateur Platform avant l'évaluation du
`ROLE_ADMIN` requis par la mutation.

`sizeBytes` est calculé à partir du `filesize` APIGREEN documenté en Ko :
`sizeBytes = filesize * 1024`. Il correspond à `media__media.content_size`,
exprimé en octets. Aucun upload binaire n'est réalisé vers S3 par cette
mutation : le fichier est déjà stocké et Platform reçoit son chemin S3.

L'intégration utilise deux types de clés :

| Sens | Clé | Usage |
|---|---|---|---|
| Hub → Platform | Une clé commune à toutes les instances Platform | Enregistrer les métadonnées des images dans Platform |
| Platform → Hub | Une clé distincte par instance | Uploader les médias vers le Hub |

La clé commune Hub → Platform et les clés Platform → Hub sont stockées dans
les gestionnaires de secrets des deux services. Les clés Platform → Hub sont
distinguées par `organization_id` dans le Secret Kubernetes du Hub et peuvent
être rotées indépendamment.

État actuel : la mutation de synchronisation est implémentée dans Platform et
couverte par des tests PHPUnit. Le contrat externe, le mapping et l'exemple
JSON restent la référence à valider avec le Hub.

## Interface d'association d'un dossier Hub

Toutes les étapes personnalisées (`OtherStep`) peuvent porter les métadonnées
Hub suivantes : `aiotCode`, `folderNumber` et `contactEmail`. Elles sont
stockées dans `hub_metadata`, avec le booléen `enabled` (faux par défaut).

Lorsque le feature flag `hub_api_green` est actif, le BO affiche sur l'étape un
toggle « Association avec le Hub API Green ». Les trois champs sont affichés
et deviennent obligatoires uniquement lorsque le toggle est activé. Leur
validation inclut le format de l'adresse e-mail.

Lors de la création d'un projet à partir des templates `public-inquiry` ou
`public-consultation`, le toggle est activé par défaut sur l'étape Documents.
Les projets existants ne sont pas activés par la migration : la colonne est
ajoutée avec une valeur par défaut à `false`.

Le token Hub est renseigné dans l'onglet BO `Hub API Green` et stocké dans la
configuration `external_service_configuration` sous le type
`hub_api_green_token`. Platform appelle le Hub uniquement lorsque le feature
flag est actif, que le toggle est activé et que les trois valeurs sont valides,
après l'enregistrement de l'étape :

```text
POST {SYMFONY_HUB_API_GREEN_URL}/api/v1/folder-links
Authorization: Bearer {token configuré dans le BO}
```

Le payload d'association suit le contrat Hub actuel :

```json
{
  "folderNumber": "T0603151600",
  "aiotCode": "0003013833",
  "stepId": "step-id-platform",
  "consultationUrl": "https://{platform_instance_url}/projects/{project_slug}",
  "contactEmail": "contact@example.com"
}
```

Les valeurs de l'étape sont enregistrées avant l'appel au Hub. En cas de refus
du service tiers, la mutation retourne une erreur, mais les valeurs restent
enregistrées afin de pouvoir les corriger et relancer l'association.

## Issue 2 — Enregistrer ou réutiliser un média S3 dans Platform

Commit : `feat: synchroniser les medias s3 vers platform`

- implémenter la mutation Platform dédiée avec l'entrée `SynchronizeHubApiGreenMediaInput` ;
- transmettre uniquement le chemin S3 et les métadonnées : aucun upload binaire vers S3 dans cet appel ;
- créer ou réutiliser la ligne `media__media` avec `content_size` en octets ;
- placer `source: hub-api-green`, `storage: s3`, `stepId` et les informations de classement dans les métadonnées du média ; `s3Path` reste le champ fonctionnel unique du document, sans modifier le schéma BDD Platform ;
- dériver une référence stable de `stepId` et `documentId` pour mettre à jour le même média lors d'une nouvelle version et rendre un appel rejoué idempotent.

État actuel : implémenté dans
`SynchronizeHubApiGreenMediaMutation`, avec couverture PHPUnit pour la création,
la réutilisation et les rejoués.

## Issue 3 — Publier l'arborescence complète dans `other.stepBody`

Commit : `feat: reconstruire l'arborescence des documents`

- récupérer le snapshot complet des documents publiables ;
- aplatir la hiérarchie fournie par le Hub ;
- regrouper les fichiers par `category` lorsqu'elle est renseignée, sinon par `fileType` ; ordonner les groupes selon leur plus petit `fileType`, puis trier les fichiers de chaque groupe par `fileType`, `documentTypeCode`, `documentLabel`, `filename`, `documentId` et `documentVersion` ;
- réécrire la totalité de `other.stepBody` à chaque synchronisation, en reliant chaque entrée à l'URL S3 publique du document.

Le rendu est stocké dans `OtherStep::body` sous forme de HTML : un titre et une
introduction, suivis de groupes `<p><strong>…</strong></p>` et de liens
`<p><a href="https://{s3_public_url}/...">nom du fichier</a></p>`. La catégorie est utilisée
comme titre de groupe ; lorsqu'elle est absente, le libellé du type de document
sert de repli. Les URLs des liens sont générées à partir de la clé contenue
dans `s3Path` et de `SYMFONY_HUB_API_GREEN_S3_PUBLIC_URL`. Un seul titre HTML
est généré par groupe.

État actuel : implémenté dans
`SynchronizeHubApiGreenMediaMutation`, avec reconstruction complète et stable
du `stepBody`.

## Issue 4 — Gérer les rejoués et les nouvelles versions

Commit : `feat: rendre la synchronisation idempotente`

- garantir qu'un appel rejoué ne duplique ni le média ni l'entrée de l'arborescence ;
- identifier un média par `stepId` et `documentId`, indépendamment de sa version et de son chemin S3 ;
- mettre à jour la ligne existante avec la nouvelle version Hub ;
- conserver les hashes et versions Hub dans les métadonnées pour l'investigation.

État actuel : l'identification par `stepId` et `documentId` permet les rejoués,
les nouvelles versions et la reprise après une erreur de validation.

## Issue 5 — Retirer les documents absents du snapshot

Commit : `feat: réconcilier les suppressions de documents`

- considérer l'absence d'un document dans le snapshot complet comme un retrait ;
- retirer l'entrée de `other.stepBody` et supprimer la ligne `media__media` Platform concernée ;
- ne pas supprimer l'objet S3 ;
- recréer le média sans doublon si le document réapparaît dans un snapshot ultérieur.

État actuel : l'absence d'un document dans le snapshot supprime le média et
l'entrée de l'arborescence Platform, sans supprimer l'objet S3. Un snapshot
ultérieur peut recréer le média.

## Issue 6 — Fiabiliser la publication asynchrone

Commit : `feat: fiabiliser la publication platform`

- publier la synchronisation via le worker NATS JetStream existant ;
- acquitter le message uniquement après le succès de Platform ;
- appliquer les retries et la file d'échec existants aux erreurs GraphQL, timeouts et réponses non valides ;
- journaliser `stepId`, `folderNumber`, l'origine Platform, l'opération et le statut HTTP sans secret ni contenu de fichier ;
- documenter les scénarios de reprise et les tests d'intégration.

État actuel : la publication asynchrone via NATS JetStream n'est pas encore
implémentée dans Platform. Les retries et la file d'échec restent à traiter.

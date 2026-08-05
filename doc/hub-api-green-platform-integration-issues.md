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

État testable : le contrat, le mapping et un exemple JSON réel sont relus et
validés ; aucun appel Platform n'est encore effectué.

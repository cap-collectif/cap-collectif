# Prototype de message vocal

La homepage publique propose à tous les visiteurs, même sans connexion, un bouton « Enregistrer un vocal ».
Le parcours est : enregistrer, arrêter, réécouter, envoyer. Le navigateur arrête
l’enregistrement après 60 secondes. Un échec d’envoi conserve le vocal pour réessayer.

`POST /api/voice-messages` reçoit un fichier multipart `file` avec le jeton
`X-CSRF-Token` généré pour `voice_message`. La route accepte les visiteurs anonymes,
valide le jeton CSRF, le type détecté et la taille du fichier, puis utilise l’antivirus existant.
La limite est de 5 Mo, sous réserve d’une limite globale d’upload plus basse.
Les formats acceptés sont WebM, Ogg et MP4, selon les capacités du navigateur.

Le fichier est stocké hors du dossier public, dans `var/voice-messages/`. Sa référence est
enregistrée dans `media__media`, avec le contexte `voice_message` et un nom
aléatoire généré côté serveur. Aucune migration n’est nécessaire.

Le back-office propose **Contributions → Messages vocaux** à l’adresse
`/admin-next/voice-messages`, réservée à `ROLE_ADMIN`. La page reprend le layout
et le tableau des listes admin-next. Elle affiche les vocaux paginés
avec leur date, leur utilisateur, leur taille, un lecteur audio et un lien de téléchargement.
La lecture et le téléchargement passent par `GET /admin/voice-messages/{vocalId}/file`,
qui exige `ROLE_ADMIN`, y compris lorsque l’URL du fichier est connue.
Le paramètre `download=1` force le téléchargement. Les réponses sont privées et non mises en cache.
La liste est fournie par la Query GraphQL `vocals`, également réservée aux
administrateurs et paginée. L’ancienne page `/admin/voice-messages` redirige vers la page Next.

Lors de la mise à jour d’une instance ayant déjà utilisé ce prototype, déplacer
les fichiers de `public/media/voice_message/0001/01/` vers `var/voice-messages/`
en conservant leurs noms. Vérifier leur intégrité puis supprimer toute copie
publique. Le dossier privé doit être persistant, sauvegardé et accessible au
processus PHP ; ne pas le supprimer lors d’un nettoyage de `var/`.

Limites du prototype : interface en français, pas de transcription,
ni de rattachement à une contribution. Le champ `author_name` conserve le pseudonyme
au moment de l’envoi, ou « Anonyme » sans connexion. Il ne constitue pas une relation
vers le compte utilisateur. Les anciens vocaux affichent « Non renseigné ».
La durée est limitée côté navigateur uniquement. Le serveur valide le conteneur
média mais ne vérifie ni sa durée ni l’absence de piste vidéo.

Le microphone nécessite HTTPS ou localhost et l’autorisation du navigateur.

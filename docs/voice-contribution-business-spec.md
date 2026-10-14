# Spécification métier — Dépôt vocal

## 1. Objectif

Permettre à un utilisateur de déposer une contribution vocale depuis la page d’accueil, sans créer de compte, afin de partager une idée ou une solution.

Une contribution vocale est indépendante d’une proposition classique : elle ne crée pas de proposition et ne suit pas le parcours de dépôt textuel.

Le parcours doit être utilisable sur ordinateur comme sur mobile.

## 2. Acteurs

- **Utilisateur connecté** : utilisateur disposant déjà d’un compte.
- **Utilisateur anonyme** : utilisateur qui participe sans compte, identifié par son participant et sa session.
- **Administrateur** : utilisateur autorisé à consulter les contributions vocales dans le back-office.
- **Super administrateur** : utilisateur pouvant activer la fonctionnalité sur l’instance.

## 3. Activation de la fonctionnalité

La fonctionnalité « Dépôt vocal » est activable par un super administrateur.

Lorsqu’elle est activée :

- le bouton « Dicter ma solution » peut être affiché sur la page d’accueil ;
- l’administrateur peut activer le dépôt vocal sur l’étape de dépôt concernée ;
- une seule étape du projet est habilitée à recevoir les contributions vocales.

Le dépôt vocal est disponible uniquement si la fonctionnalité est activée et si l’étape de dépôt est configurée pour l’accepter.

## 4. Accès au dépôt vocal

L’utilisateur accède à une page ou une modale dédiée depuis le bouton « Dicter ma solution » de la page d’accueil.

## 5. Conseils affichés avant l’enregistrement

Le message suivant est affiché avant l’enregistrement :

### Quelques conseils avant d’enregistrer

- **Installez-vous au calme**, pour une bonne transcription.
- **Structurez votre message :** l’enjeu, une situation concrète, votre idée. Précisez votre secteur ou votre région.
- **Parlez naturellement.** Pas besoin de lire un texte.
- **Ne citez pas de personnes ou d’entreprises**, et ne donnez pas d’informations personnelles.
- **Vous pourrez réécouter et recommencer** l’enregistrement si besoin.

## 6. Règles d’enregistrement

L’utilisateur peut :

- démarrer un enregistrement ;
- visualiser clairement la durée maximale autorisée ;
- enregistrer un vocal d’une durée maximale de 3 minutes ;
- réécouter son enregistrement ;
- recommencer l’enregistrement avant de l’envoyer ;
- envoyer son enregistrement.

Un vocal de moins de 10 secondes ne peut pas être envoyé.

L’enregistrement s’arrête automatiquement au bout de 3 minutes afin que l’utilisateur ne parle pas au-delà de la durée autorisée.

L’utilisateur peut déposer autant de vocaux qu’il le souhaite. Un seul enregistrement est manipulé à la fois.

Après l’envoi d’un vocal, l’utilisateur ne peut plus modifier ni remplacer cet enregistrement.

## 7. Règles communes de validation

Lorsqu’un utilisateur clique sur « Valider ce vocal » :

- si aucune information n’est requise sur l’étape de dépôt, le vocal est immédiatement validé ;
- si des informations sont requises, l’utilisateur est dirigé vers le parcours de collecte correspondant.

Un vocal ne devient une contribution validée qu’après la complétion des informations obligatoires, lorsqu’elles existent.

La contribution vocale ne crée jamais de proposition.

### Consentement facultatif

Le consentement facultatif est toujours proposé dans le parcours lorsque l’utilisateur ne l’a pas déjà accepté, indépendamment des informations obligatoires activées sur l’étape.

Il n’est pas redemandé si l’utilisateur l’a déjà accepté :

- via son compte ;
- ou lors d’une participation précédente sans compte.

Le refus de ce consentement facultatif ne bloque pas la validation du vocal.

## 8. Parcours d’un utilisateur connecté

### 8.1 Dépôt sans information complémentaire

1. L’utilisateur ouvre le dépôt vocal depuis la page d’accueil.
2. Il enregistre son vocal.
3. Il peut le réécouter ou recommencer l’enregistrement.
4. Il valide son vocal.
5. Si aucune information complémentaire n’est requise, le vocal est immédiatement validé.
6. L’utilisateur est redirigé vers la page d’accueil.

### 8.2 Dépôt avec informations requises

1. L’utilisateur ouvre le dépôt vocal depuis la page d’accueil.
2. Il enregistre son vocal.
3. Il peut le réécouter ou recommencer l’enregistrement.
4. Il valide son vocal.
5. Le parcours de collecte s’ouvre si l’étape comporte des informations obligatoires qui ne sont pas encore disponibles.
6. L’utilisateur complète les informations demandées.
7. Le vocal est validé.
8. L’utilisateur est redirigé vers la page d’accueil.

Les informations déjà connues et valides pour l’utilisateur ne doivent pas lui être redemandées inutilement.

Le consentement facultatif suit la règle commune décrite dans la section « Consentement facultatif ».

## 9. Parcours d’un utilisateur anonyme

### 9.1 Dépôt sans information complémentaire

1. L’utilisateur ouvre le dépôt vocal depuis la page d’accueil.
2. Il enregistre son vocal.
3. Il peut le réécouter ou recommencer l’enregistrement.
4. Il valide son vocal.
5. Si aucune information complémentaire n’est requise, le vocal est immédiatement validé.
6. L’utilisateur est redirigé vers la page d’accueil.

### 9.2 Dépôt avec informations requises

1. L’utilisateur ouvre le dépôt vocal depuis la page d’accueil.
2. Il enregistre son vocal.
3. Il peut le réécouter ou recommencer l’enregistrement.
4. Il valide son vocal.
5. Le parcours sans compte s’ouvre.
6. L’utilisateur renseigne les mêmes informations que celles demandées pour un dépôt classique sur l’étape concernée.
7. Cela peut notamment inclure un téléphone, une adresse e-mail, un nom, une adresse ou toute autre information obligatoire configurée sur l’étape.
8. Le consentement facultatif est proposé s’il n’a pas déjà été accepté lors d’une participation précédente.
9. Après validation des informations, le vocal est validé.
10. L’utilisateur est redirigé vers la page d’accueil.

L’utilisateur n’a pas besoin de créer de compte pour terminer le dépôt.

## 10. Identification ultérieure de l’utilisateur

Une contribution déposée anonymement est d’abord associée au participant correspondant.

Si l’utilisateur est identifié ultérieurement, la contribution vocale peut être rattachée à son compte selon les règles habituelles de réconciliation des participants.

Cette réconciliation ne transforme pas la contribution vocale en proposition.

## 11. États métier d’une contribution

Une contribution vocale peut avoir les états suivants :

- **Informations manquantes** : le vocal a été envoyé, mais les informations obligatoires du parcours ne sont pas encore complétées.
- **Validée** : le vocal a été envoyé et toutes les informations obligatoires ont été complétées, ou aucune information n’était requise.

Une contribution « Informations manquantes » peut devenir « Validée » lorsque l’utilisateur termine le parcours correspondant.

Une fois le vocal envoyé, son contenu ne peut plus être modifié, y compris lorsque des informations restent à compléter.

## 12. Fermeture ou abandon du parcours

### Avant l’envoi du vocal

Si l’utilisateur ferme la modale ou quitte la page avant d’avoir envoyé son enregistrement :

- aucune contribution vocale n’est validée ;
- l’enregistrement en cours est abandonné ;
- l’utilisateur peut recommencer ultérieurement depuis la page d’accueil.

### Après l’envoi du vocal

Si l’utilisateur quitte le parcours après avoir envoyé son vocal mais avant d’avoir complété les informations requises :

- le vocal reste dans l’état « Informations manquantes » ;
- il n’est pas considéré comme validé ;
- l’utilisateur ne peut pas modifier ou remplacer ce vocal ;
- il pourra éventuellement déposer un nouveau vocal ultérieurement.

La règle de conservation ou de suppression des contributions abandonnées reste à définir.

## 13. Parcours d’un administrateur dans le back-office

### 13.1 Accès

Seuls les administrateurs habilités peuvent accéder aux contributions vocales.

Les contributions vocales ne sont pas accessibles depuis l’espace utilisateur.

### 13.2 Liste des contributions

Le back-office permet de lister les contributions vocales et d’identifier leur état :

- informations manquantes ;
- validée.

Les contributions sont consultables quel que soit leur état, afin de permettre de mesurer les abandons et les parcours incomplets.

La liste permet d’afficher notamment :

- l’état de la contribution ;
- la date de dépôt ;
- l’utilisateur lorsque la contribution est rattachée à un compte ;
- le participant et ses informations disponibles lorsqu’elle est anonyme ;
- l’accès à la réécoute du vocal.

Un bouton d’export est disponible en face de chaque vocal.

Un bouton d’export global est également disponible en haut de la page. Il permet de télécharger, sans filtre de période, l’ensemble des vocaux accessibles dans la liste au moment de l’export, sous la forme d’un fichier ZIP nommé `vocals_{date_du_jour}.zip`.

Dans le ZIP, chaque fichier vocal est nommé selon la règle suivante :

- `{id_contrib}.extension`, où `id_contrib` est l’identifiant de la contribution.

Les vocaux dont les informations obligatoires ne sont pas encore complétées sont inclus dans les exports, comme dans la liste du back-office.

### 13.3 Réécoute et export

Un administrateur peut réécouter un vocal depuis le back-office.

Il peut également télécharger un vocal individuellement ou télécharger l’export global proposé en haut de la liste.

Le fichier audio n’est pas public et ne doit pas être accessible à un utilisateur non autorisé.

### 13.4 Modification et suppression

Dans le périmètre initial :

- l’administrateur ne modifie pas le contenu du vocal ;
- la suppression par l’utilisateur après validation n’est pas obligatoire ;
- la suppression pourra être ajoutée ultérieurement si nécessaire.

## 14. Cas particuliers

- Un vocal de moins de 10 secondes est refusé.
- Un enregistrement est automatiquement arrêté à 3 minutes.
- Un utilisateur peut recommencer avant l’envoi, mais pas après.
- Un utilisateur peut déposer plusieurs vocaux, un à la fois.
- Un dépôt vocal ne crée pas de proposition.
- Un utilisateur peut participer sans compte.
- Les informations obligatoires dépendent de l’étape de dépôt activée.
- L’absence de requirements permet une validation immédiate sans parcours complémentaire.
- La fermeture avant l’envoi abandonne l’enregistrement en cours.
- La fermeture après l’envoi laisse une contribution avec informations manquantes.

## 15. Hors périmètre initial

- Création d’une proposition à partir d’un vocal.
- Modification ou correction d’une transcription.
- Listing des vocaux par l’utilisateur.
- Suppression obligatoire d’un vocal après validation.
- Création d’un compte spécifique pour déposer un vocal.
- Définition de la durée de conservation des contributions abandonnées.

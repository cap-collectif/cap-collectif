# Audit et remise en état des tests User et Participant

> Audit statique initial réalisé le 25 septembre 2026 sur la branche `20284-tests-users`, commit `48f0cc82ac`.
>
> Les inventaires, chiffres et lacunes des sections initiales décrivent cet état historique. Le plan actualisé et les comptes rendus datés décrivent les travaux suivants ; les résultats de validation restent associés à la version exécutée. La partie 5 tient compte du retrait des restaurations Jest en fin de suite le 7 octobre 2026.
>
> Objectif : remettre les tests liés aux User et Participant d’aplomb : couverture des contrats existants, assertions explicites, isolation, exécution et découverte CI. Les frameworks cibles sur ce périmètre sont PHPUnit, Jest et Cypress.

## Décision de périmètre — clarifications des 6 et 7 octobre 2026

**Cet audit concerne uniquement la remise en état des tests User/Participant. Le code de production, FOSUserBundle et le schéma SQL restent en place. La table `fos_user`, ses colonnes et les données existantes ne sont pas renommées.**

La suppression de FOSUserBundle appartient au chantier séparé `18981-remove-fos-user`, avec une stack de 11 branches en attente indiquée par l’utilisateur. Cette stack sera reprise plus tard ; elle ne fait pas partie du plan de cet audit.

Les préparations et vérifications SQL des tests restent donc valables. Elles peuvent volontairement vérifier les noms physiques du schéma conservé et doivent échouer si ce contrat change. Elles ne constituent pas, à elles seules, une dépendance au code PHP de FOSUserBundle. Les tests peuvent réduire leurs dépendances aux détails internes lorsqu’ils passent par les contrats publics existants, sans refonte de production. Un préfixe `fos_user` dans le stockage ou un contrat public n’est pas un motif de remplacement.

Les comptes rendus ci-dessous conservent les réalisations et validations historiques. Les prescriptions initiales demandant de supprimer tout SQL sur `fos_user` sont corrigées dans ce document. La partie 5 a été reprise sur la branche existante : les helpers Doctrine introduits uniquement pour masquer le schéma sont retirés et les accès SQL utiles sont rétablis. Le compte rendu de cette révision distingue les validations de l'ancienne approche de celles du résultat corrigé.

## Résumé exécutif de l’audit initial — 25 septembre 2026

La couverture fonctionnelle existe, mais certaines assertions, lacunes et dépendances entre scénarios limitent la fiabilité des tests User/Participant.

Les points positifs sont les suivants :

- les principaux parcours visibles sont couverts par Cypress : inscription, connexion, déconnexion, confirmation d'adresse e-mail, changement et réinitialisation du mot de passe, profil, suppression/anonymisation, invitations, groupes et SSO ;
- les contrats GraphQL sont largement exercés par Jest dans `features/graphql-api` ;
- les algorithmes d'anonymisation automatisée, une partie de la réconciliation `Participant` → `User`, les exports et les fournisseurs OAuth/OpenID/FranceConnect disposent déjà de tests PHPUnit substantiels ;
- les mutations Jest restaurent la base avant chaque test et 25 des 27 fichiers Cypress retenus par le screening appliquent `db:restore`.

Les écarts de test identifiés dans l’audit initial sont :

1. **PHPSpec est encore une suite active de CI.** Le dépôt contient 239 specs, dont 62 fichiers candidats sur le périmètre identité. Les contrats utiles doivent être migrés vers PHPUnit ; les specs « initializable » sans contrat métier peuvent être supprimées.
2. **23 artefacts de test nommaient directement FOSUserBundle ou `fos_user` lors de l’audit initial.** Cet inventaire mélange des dépendances PHP à remplacer et des références au schéma SQL conservé. Les références à la table `fos_user` restent valables. Les couplages PHP sont à examiner pour améliorer les tests, sans imposer une adaptation de production dans cet audit.
3. **Les suites Cypress de réconciliation ne sont pas fiables comme filet de sécurité.** `proposalSelectionVoteWorkflow.cy.ts` contient un `it.only`, ainsi que plusieurs suites/tests ignorés ; `proposalCollectVoteWorkflow.cy.ts` contient également plusieurs suites/tests ignorés.
4. **Le cœur du modèle est peu caractérisé.** `UserSpec` ne vérifie que l'initialisation et un cas de `getContributions()`. Il n'existe pas de test unitaire direct de `Participant`, des invariants d'identité, des rôles, de l'état du compte ou du cycle des jetons.
5. **Des composants critiques n'ont pas de test backend dédié** : `SamlAuthenticator`, `SamlUserProvider`, `SAMLLogoutHandler`, `CasAuthenticator`, `SimplePreAuthenticator`, `ResettingController`, `MagicLinkController`, `ProfileController`, `MembersController`, `CreateUserMutation`, `DeleteParticipantMutation`, `SendMagicLinkEmailMutation`, `ResetPasswordMutation`, `ResendEmailConfirmationMutation` et les mutations de téléphone du `Participant`.
6. **Une partie importante des assertions repose sur des snapshots.** 98 des 110 candidats Jest GraphQL et les 94 candidats Jest UI utilisent `toMatchSnapshot`. Les snapshots sont utiles pour la forme d'une réponse, mais protègent mal les invariants d'identité et rendent les migrations bruyantes.

Verdict initial : **renforcer les tests User/Participant et leur fiabilité**. Migrer leurs contrats PHPSpec utiles, privilégier les résultats publics et les effets persistés, puis compléter les lacunes de couverture décrites dans cet audit.

## Périmètre et méthode

Le terme « User » est pris ici au sens large :

- **User** : compte persistant, identifiants, rôles, profil, préférences, consentements et contenu associé ;
- **Participant** : identité sans compte utilisée dans les parcours de participation ;
- **identité authentifiée** : connexion locale, magic link, CAS, SAML, OAuth2, OpenID, Facebook et FranceConnect ;
- **cycle de compte** : inscription, invitation, confirmation, changement d'adresse e-mail, mot de passe, suppression, account anonymization et archive ;
- **passage Participant → User** : réconciliation des propositions, réponses et votes ;
- **autorisations liées à l'identité** : rôles, groupes, types d'utilisateur, appartenance à une organisation et exigences de participation.

Un test est retenu lorsqu'il vérifie directement un de ces contrats ou lorsque son résultat dépend de la nature de l'identité (`User`, `Participant`, anonyme, rôle ou groupe). Un test qui se connecte seulement comme précondition d'une fonctionnalité sans vérifier de comportement d'identité est hors inventaire principal.

Le screening initial a porté sur :

| Suite | Taille totale | Fichiers candidats inspectés |
|---|---:|---:|
| PHPUnit (`tests/**/*Test.php`) | 107 | 50 par nom, plus les 2 reconcilers |
| PHPSpec (`spec/**/*Spec.php`) | 239 | 62 |
| Jest UI legacy (`frontend/**/*-test.*`) | 548 | inclus dans 94 candidats UI |
| Jest admin-next | 77 | inclus dans 94 candidats UI |
| Jest GraphQL (`features/graphql-api`) | 428 | 110 |
| Cypress (`cypress/e2e/**/*.cy.ts`) | 91 | 27 |

Ces nombres sont un screening conservateur par nom et contenu, pas une mesure de couverture. Les fichiers qui ne font qu'envoyer un e-mail ou afficher l'auteur d'un contenu ont ensuite été classés comme adjacents ou exclus.

## Carte du domaine et des tests existants

### 1. Modèle User et état du compte

Production principale :

- `src/Capco/UserBundle/Entity/AbstractUser.php` étend directement `FOS\UserBundle\Model\User` ;
- `src/Capco/UserBundle/Entity/User.php` porte à la fois les données de compte, le profil, les rôles, les compteurs, les consentements, les jetons, les associations SSO et les relations vers les contributions ;
- la persistance reste configurée autour de la table `fos_user`.

Tests existants :

- `spec/Capco/UserBundle/Entity/UserSpec.php` : initialisation et un cas de contributions ;
- `spec/Capco/AppBundle/Model/UserActivitySpec.php` : agrégation d'activité ;
- `tests/Command/RecalculateUsersCountersCommandTest.php` : recalcul de compteurs ;
- les queries Jest sous `features/graphql-api/internal/Query/User/` et `features/graphql-api/public/Query/User/` : arguments, commentaires, connexions, organisations, propositions, réponses, sources et votes ;
- les tests Jest UI sous `frontend/js/components/User/`, ainsi que `frontend/js/redux/modules/user-test.ts` ;
- `cypress/e2e/frontOffice/userProfile/userProfile.cy.ts` : affichage public du profil ;
- `cypress/e2e/backOffice/user/userBO.cy.ts` : création, modification et suppression depuis le back-office.

Évaluation : **insuffisant au niveau du modèle**. Les tests de lecture GraphQL et d'interface sont nombreux, mais les invariants actuellement portés par l’entité et son héritage ne sont pas explicités.

À caractériser en PHPUnit par les comportements publics existants :

- valeur par défaut des rôles et déduplication/hiérarchie des rôles ;
- identité de sécurité (`getUserIdentifier`), comparaison de deux identités et comportement d'un compte anonymisé/supprimé/verrouillé ;
- normalisation/canonicalisation de l'adresse e-mail et du nom d'utilisateur ;
- invariants des états `enabled`, confirmé, verrouillé, supprimé et anonymisé ;
- cycle de vie des jetons de confirmation, de réinitialisation, de changement d'adresse e-mail et de magic link ;
- conservation des relations et du contenu associé lors de l'account anonymization ;
- compteurs et collections, avec tests unitaires ciblés plutôt qu'une dépendance à des fixtures SQL.

### 2. Participant, identité anonyme et réconciliation

Tests existants :

- `tests/Normalizer/ParticipantNormalizerTest.php` ;
- `tests/Normalizer/Debate/AnonymousArgumentNormalizerTest.php` ;
- `tests/Normalizer/Debate/DebateParticipantNormalizerKeysTest.php` ;
- `tests/Service/ParticipantAccessResolverTest.php` ;
- `tests/Service/ProposalReconcillierTest.php` ;
- `tests/Service/ReplyReconcilierTest.php` ;
- `tests/Mutation/SendParticipantEmailWorkflowMutationTest.php` ;
- les exports `Export*ParticipantsCommandTest.php` ;
- les mutations Jest `AnonymousReply/*`, `Debate/*Anonymous*`, `updateParticipant.js` et les queries `Participant/*`, `Query_participantPersonalData.js`, `Query_participants.js` ;
- les trois grandes suites Cypress `frontOfficeWorkflow/*Workflow.cy.ts` ;
- `cypress/e2e/frontOffice/debate/anonymousVote.cy.ts` et `event/eventRegistration.cy.ts`.

Les reconcilers de proposition et de réponse disposent de bons cas métier : e-mail identique/différent, étape fermée, réponses multiples, exigence SSO et téléphone vérifié.

Lacunes :

- aucun test unitaire direct de `Participant` ;
- aucun test dédié de `ContributionsReconcilier` ou `VotesReconcilier` ;
- `DeleteParticipantMutation` n'a pas de test backend identifié ;
- les mutations d'envoi et de vérification du téléphone d'un `Participant` n'ont pas de matrice backend dédiée ;
- les règles de fusion des votes sont surtout protégées par de très gros scénarios Cypress, dont une partie est ignorée ;
- l'unicité et la rotation du token `Participant`, la confirmation d'adresse e-mail, les consentements et les transitions vers un `User` ne sont pas caractérisés au niveau du domaine.

À ajouter : une matrice PHPUnit sur les reconcilers (aucune perte de contenu, idempotence, limites/budget/ranking, conflit entre identités, rollback) et des tests GraphQL explicites des codes d'erreur des mutations Participant.

### 3. Inscription, invitations et confirmation d'adresse e-mail

Tests existants :

- `spec/Capco/AppBundle/GraphQL/Mutation/RegisterMutationSpec.php` ;
- `features/graphql-api/internal/Mutation/Other/register.js` ;
- `features/graphql-api/internal/Mutation/inviteUsers.js` et `cancelUserInvitations.js` ;
- `features/graphql-api/internal/Query/Query_userInvitations*.js` ;
- `tests/Processor/UserInvite/UserInviteNewInvitationProcessorTest.php` et son snapshot ;
- `spec/Capco/AppBundle/Notifier/UserInviteEmailMessageNotifierSpec.php` ;
- `spec/Capco/UserBundle/Handler/UserInvitationHandlerSpec.php` ;
- `spec/Capco/UserBundle/Controller/ConfirmationControllerSpec.php` ;
- les tests Jest des composants `admin-next/shared/register/`, `frontend/js/components/Admin/Registration*` et `frontend/js/components/User/Invitation/` ;
- `cypress/e2e/frontOffice/user/user.cy.ts` ;
- `cypress/e2e/frontOffice/user/emailConfirmation.cy.ts` ;
- `cypress/e2e/frontOffice/invitation/invitation.cy.ts` ;
- `cypress/e2e/backOffice/invitation/userInvite.cy.ts` ;
- `cypress/e2e/frontOffice/invitation/organizationInvitation.cy.ts`.

Les happy paths sont bien visibles. Les branches suivantes sont à renforcer :

- collision après canonicalisation de l'adresse e-mail et casse/espaces ;
- jeton invalide, expiré, rejoué ou déjà consommé ;
- atomicité entre création du compte, association aux groupes et invitation d'organisation ;
- comportement identique avec inscription désactivée ou shield activé ;
- validation serveur de la complexité du mot de passe ;
- conservation des consentements et du type utilisateur ;
- réponse non révélatrice lorsqu'une adresse existe déjà.

### 4. Connexion locale, session, magic link et mot de passe

Tests existants :

- `spec/Capco/AppBundle/EventListener/AuthenticationHandlerSpec.php` ;
- `spec/Capco/AppBundle/EventListener/EmptyUsernameListenerSpec.php` ;
- `spec/Capco/UserBundle/Authenticator/MagicLinkAuthenticatorSpec.php` ;
- `spec/Capco/UserBundle/Security/SessionWithJsonHandlerSpec.php` et `tests/UserBundle/Security/SessionWithJsonHandlerTest.php` ;
- `tests/UserBundle/Security/Http/Logout/LogoutSuccessHandlerTest.php` ;
- `spec/Capco/AppBundle/GraphQL/Mutation/Profile/UpdateProfilePasswordMutationSpec.php` ;
- `spec/Capco/AppBundle/GraphQL/Mutation/UpdateProfileAccountEmailMutationSpec.php` ;
- `features/graphql-api/internal/Mutation/updateProfile.js` et `cancelEmailChange.js` ;
- les tests Jest `Login*-test.tsx`, `AccountForm-test.tsx`, `ChangePasswordForm-test.tsx`, `ResetPasswordForm-test.tsx`, `UserPassword*-test.tsx` ;
- `cypress/e2e/frontOffice/user/login.cy.ts`, `account.cy.ts` et la partie mot de passe de `profile.cy.ts`.

Couverture fonctionnelle actuelle : connexion/déconnexion, erreur de mot de passe, apparition du CAPTCHA après échecs, demande de réinitialisation, réinitialisation heureuse, changement de mot de passe et validation de formulaire.

Lacunes prioritaires :

- aucun test backend dédié de `ResettingController` ou `ResetPasswordMutation` ;
- aucun test backend dédié de `MagicLinkController` ou `SendMagicLinkEmailMutation` ;
- aucun test backend dédié de `ResendEmailConfirmationMutation` ;
- aucun contrat sur jeton expiré/réutilisé, rotation du jeton, invalidation des sessions ou mise à niveau du hash ;
- pas de matrice claire verrouillé/désactivé/non confirmé/anonymisé/supprimé ;
- pas de test explicite d'anti-énumération des comptes et de rate limiting sur les demandes de reset/magic link ;
- `UserEmailProvider` n'est exercé qu'indirectement par le spec du magic link.

### 5. SSO : CAS, SAML, OAuth2, OpenID, Facebook et FranceConnect

Tests existants :

- `tests/Authentication/OauthUserProviderTest.php` : création/chargement, mapping OpenID/FranceConnect/Facebook, association et validation state/nonce ;
- `tests/Authentication/OpenID/OpenIDResourceOwnerTest.php` ;
- `tests/Authentication/FranceConnect/FranceConnectOptionsModifierTest.php` ;
- `tests/Authentication/FranceConnect/FranceConnectResourceOwnerTest.php` ;
- `tests/Controller/Site/SSOControllerTest.php` ;
- `tests/EventListener/OpenIdCallbackTargetPathSubscriberTest.php` ;
- `tests/EventListener/FranceConnectLogoutSubscriberTest.php` ;
- `tests/Mutation/RemoveSsoConnectionMutationTest.php` ;
- les specs PHPSpec `CasUserProviderSpec`, `CASLogoutHandlerSpec`, `OpenIDLogoutHandlerSpec`, `FranceConnectLogoutHandlerSpec`, `CasHandlerSpec` et `CapebUserFilterSpec` ;
- les mutations Jest `Authentication/sso*.js`, `Sso/FranceConnect/updateFranceConnectSSOConfiguration.js` et la query `Query_ssoConfigurations.js` ;
- `cypress/e2e/frontOffice/user/sso.cy.ts` et `frontend/js/components/Page/SSOSwitchUserPage-test.tsx`.

La couverture OAuth/OpenID/FranceConnect est la partie backend la plus avancée, mais `OauthUserProviderTest` mocke directement `FOS\UserBundle\Model\UserManagerInterface` : le test cassera au retrait du vendor même si le comportement reste correct.

Composants sans test dédié identifié :

- `SamlAuthenticator`, `SamlUserProvider`, `SAMLLogoutHandler` ;
- `CasAuthenticator` et `SimplePreAuthenticator` ;
- callback SSO complet, collision d'adresse e-mail et rattachement à un compte existant ;
- validation de signature/issuer/audience/nonce pour tous les fournisseurs concernés ;
- logout local + fournisseur et nettoyage de session pour SAML/CAS/OpenID/FranceConnect ;
- scénarios de refus du fournisseur et erreurs réseau.

Les tests doivent vérifier les résultats des parcours existants : compte créé ou rattaché, claims copiés, session et redirection. La création d’une nouvelle interface de gestion des comptes n’est pas requise pour ce travail.

### 6. Profil, données personnelles, préférences et consentements

Tests existants :

- `spec/Capco/AppBundle/GraphQL/Mutation/UpdateProfilePersonalDataMutationSpec.php` ;
- `features/graphql-api/internal/Mutation/Other/update/updateProfileAccount.js` et `updateProfilePersonalData.js` ;
- `features/graphql-api/internal/Mutation/updateUser.js`, `updateProfile.js`, `UserNotificationConfiguration/changeUserNotificationConfiguration.js` et `Locale/setUserDefaultLocale.js` ;
- les tests Jest des composants `frontend/js/components/User/Profile/`, `User/Admin/`, alertes de confirmation et préférences ;
- `cypress/e2e/frontOffice/user/profile.cy.ts` et `account.cy.ts` ;
- `cypress/e2e/frontOffice/rgpd/rgpd.cy.ts` pour les cookies.

La couverture UI est large mais souvent composée de snapshots. Ajouter des assertions backend explicites sur :

- qui peut lire/modifier chaque champ ;
- consentements interne, externe, SMS et privacy policy ;
- changement de locale ;
- validation/normalisation du téléphone ;
- suppression des données personnelles sans suppression involontaire du contenu associé ;
- préférences de notifications et invalidation des tokens à usage unique.

### 7. Suppression, account anonymization et archive

Tests existants :

- `tests/Command/AnonymizeUsersAutomatedCommandTest.php` : plage de dates, dry-run, feature flag, idempotence, garde-fous, User et Participant, nettoyage des liens et conservation du contenu associé ;
- `tests/Mutation/AnonymizeAccountByEmailMutationTest.php` ;
- `spec/Capco/AppBundle/GraphQL/Mutation/DeleteAccountMutationSpec.php` ;
- `features/graphql-api/internal/Mutation/Account/deleteAccount.js` et `deleteAccountByEmail.js` ;
- `features/graphql-api/public/Mutation/deleteAccountByEmail.js` ;
- `features/graphql-api/internal/Mutation/Other/requestUserArchive.js` ;
- `tests/Command/DeleteUserArchiveCommandTest.php` ;
- `tests/Processor/UserArchive/UserArchiveRequestProcessorTest.php` ;
- `cypress/e2e/frontOffice/user/profile.cy.ts` et `sso.cy.ts`.

C'est la zone la mieux caractérisée au niveau intégration. Il reste à isoler les contrats de `UserAnonymizer` en PHPUnit afin que les mutations ne soient pas les seules à protéger l'algorithme : champs effacés, champs conservés, déconnexion, révocation des credentials/tokens, idempotence et contenu associé inchangé.

### 8. Groupes, rôles, types, organisations et autorisations

Tests existants :

- `tests/Service/GroupServiceTest.php` ;
- `features/graphql-api/internal/Mutation/Group/*`, `User/addUsersToGroupFromEmail.js` et `Query/Group/Group_members.js` ;
- les mutations/queries `UserType/*` et `Query_userTypes.js` ;
- les invitations d'organisation Jest et Cypress ;
- les specs `UserIsGrantedResolverSpec`, `OwnerableCreatorAccessResolverSpec`, `RequirementViewerValueResolverSpec`, `ViewerMeetsTheRequirementResolverSpec` et plusieurs voters ;
- les quatre suites Cypress `backOffice/userGroup/*.cy.ts` ;
- `cypress/e2e/backOffice/userType/userType.cy.ts` ;
- `cypress/e2e/backOffice/user/userBO.cy.ts`.

Lacunes :

- `CreateUserMutation` n'a pas de test backend dédié ; sa création back-office n'est protégée que par Cypress ;
- invariants et hiérarchie des rôles non testés sur le modèle ;
- matrice d'accès incomplète pour User, admin, super-admin, project owner, membre/admin d'organisation et anonyme ;
- peu de tests sur retrait du dernier administrateur, changement de rôle, compte supprimé ou désactivé ;
- tests GraphQL souvent centrés sur snapshots plutôt que sur les codes d'erreur et l'absence d'effet de bord.

### 9. Exports, recherche, compteurs et API

Tests existants :

- `tests/Command/ExportUsersCommandTest.php` ;
- `tests/Command/ExportUserGroupsCommandTest.php` ;
- `tests/Command/Export*ParticipantsCommandTest.php` ;
- `tests/GraphQL/Resolver/Query/QueryUsersResolverTest.php` ;
- `tests/GraphQL/Resolver/User/UserUrlResolverTest.php` ;
- `tests/Service/ProjectContributorSearchTest.php` ;
- `tests/Command/CreatePublicApiTokenCommandTest.php` ;
- `tests/PublicApi/PublicApiKeyAuthenticatorTest.php` ;
- les queries GraphQL User/Participant listées plus haut.

Les tests d'export sont de bons tests de sortie, mais restent très liés à la base de fixtures. Il faut conserver des assertions précises sur la confidentialité, l'ordre et la stabilité des colonnes exportées. Les préparations et vérifications SQL sur la table `fos_user` restent autorisées puisque son nom et son schéma sont conservés.

## Dépendances directes à FOSUserBundle dans les tests

### Imports ou collaborateurs FOS

Couplages historiques à réduire dans les tests lorsque les contrats publics existants le permettent, sans modifier la production :

- `tests/Authentication/OauthUserProviderTest.php` — `FOS\UserBundle\Model\UserManagerInterface` ;
- `tests/Mutation/RemoveSsoConnectionMutationTest.php` — même interface ;
- `spec/Capco/AppBundle/Controller/Site/Organization/OrganizationControllerSpec.php` — `LoginManagerInterface` ;
- `spec/Capco/AppBundle/GraphQL/Mutation/RegisterMutationSpec.php` — `UserManagerInterface` et `TokenGeneratorInterface` ;
- `spec/Capco/AppBundle/GraphQL/Mutation/UpdateProfileAccountEmailMutationSpec.php` — `TokenGeneratorInterface` ;
- `spec/Capco/AppBundle/GraphQL/Mutation/AddCommentMutationSpec.php` et `spec/Capco/AppBundle/Import/ImportProposalsFromCsvSpec.php` — `TokenGeneratorInterface` ;
- `spec/Capco/AppBundle/GraphQL/Resolver/Proposal/ProposalResponsesResolverSpec.php` et `ReplyResponsesResolverSpec.php` — `TokenGenerator` concret ;
- `spec/Capco/UserBundle/Authenticator/MagicLinkAuthenticatorSpec.php` — `FOS\UserBundle\Model\UserInterface` ;
- `spec/Capco/UserBundle/Controller/ConfirmationControllerSpec.php` — `FOS\UserBundle\Security\LoginManager`.

### Schéma SQL conservé : table `fos_user`

L’inventaire initial identifie les tests suivants qui préparent ou vérifient directement le schéma SQL conservé :

- `tests/Command/RecalculateUsersCountersCommandTest.php` ;
- `features/graphql-api/internal/Mutation/Other/register.js` ;
- `features/graphql-api/internal/Mutation/askProposalRevision.js` ;
- `features/graphql-api/internal/Mutation/Mediator/addMediatorVotes.js` ;
- `features/graphql-api/internal/Mutation/Mediator/updateMediatorVotes.js` ;
- `cypress/e2e/frontOfficeWorkflow/proposalCollectVoteWorkflow.cy.ts` ;
- `cypress/e2e/frontOfficeWorkflow/proposalSelectionVoteWorkflow.cy.ts` ;
- `cypress/e2e/frontOfficeWorkflow/questionnaireWorkflow.cy.ts`.

Décision actualisée : conserver le SQL direct utile pour préparer et vérifier les données de `fos_user`. Aucun remplacement systématique par Doctrine ou par des builders n'est requis. Un helper peut centraliser une préparation répétitive en gardant le SQL explicite ; sa justification doit être la lisibilité ou l'isolation, pas la disparition du nom de table. Vérifier les valeurs persistées, choisir des données déterministes et restaurer les modifications même si le test échoue.

### Routes, paramètres et clés FOS

- `spec/Capco/AppBundle/GraphQL/Resolver/User/UserResettingPasswordUrlResolverSpec.php` attend la route `fos_user_resetting_reset` ;
- `spec/Capco/AppBundle/GraphQL/Mutation/Profile/UpdateProfilePasswordMutationSpec.php`, le snapshot `features/graphql-api/internal/Mutation/__snapshots__/updateProfile.js.snap` et `cypress/e2e/frontOffice/user/profile.cy.ts` attendent des clés `fos_user.*` ;
- `config/packages/test/services.yaml` injecte `%fos_user.firewall_name%` ;
- les helpers Jest/Cypress utilisent `/login_check` et `/logout`, et Cypress vérifie directement le cookie `PHPSESSID`.

Périmètre de cet audit : caractériser les URL et erreurs publiques existantes, y compris celles portant un préfixe `fos_user`, sans renommer les routes ou paramètres. Leur éventuelle adaptation lors de la suppression du bundle appartient au chantier séparé `18981-remove-fos-user`. Le nom de la table `fos_user` reste inchangé.

## Indépendance et fiabilité des suites

### PHPUnit

Bon profil lorsqu'un test instancie un service et vérifie une sortie ou un effet métier. Les tests d'anonymisation automatisée et les reconcilers vont dans la bonne direction.

Risques :

- mocks des interfaces FOS au lieu de ports applicatifs ;
- modifications SQL non restaurées ou assertions insuffisantes sur les données persistées ;
- nombreux tests d'intégration dépendant d'une base de fixtures globale ;
- `RecalculateUsersCountersCommandTest` peut se marquer ignoré si aucune fixture adéquate n'est trouvée, ce qui masque une régression de fixture ou de comportement.

### Jest GraphQL

Le dossier `features/graphql-api` est bien une suite Jest, pas Behat. La restauration avant chaque test est enregistrée par les imports de `_setupDB` et `_setupES` dans les fichiers de test concernés ; elle n’est pas installée automatiquement par `setupFilesAfterEnv`. Le `globalSetup` sauvegarde l’état MySQL et Elasticsearch pour ces restaurations, sauf lorsque `CI_SHARED_TEST_DATA=1` ; il ne restaure pas lui-même les données. Les queries sont supposées en lecture seule et partagent l’état préparé pour leur exécution.

Risques :

- snapshots trop larges pour identifier l'invariant réellement protégé ;
- sur le corpus inspecté, 98 fichiers sur 110 utilisent un snapshot, contre seulement 21 contenant au moins une assertion explicite de valeur ;
- identifiants de fixtures et credentials globaux dans `jest-setup.e2e.js` ;
- dépendance aux données partagées : les restaurations avant chaque test isolent MySQL et Elasticsearch dans les suites qui importent les helpers, mais ne neutralisent pas les messages asynchrones ni tous les effets Redis ; l’absence de restauration finale n’est pas, à elle seule, un défaut d’isolation entre ces tests ;
- helpers d'authentification liés aux routes actuelles ;
- une mutation qui écrit dans un test classé Query contaminerait les autres tests.

Pour les contrats User, préférer des assertions explicites sur `errorCode`, état du compte et effets persistés, en gardant éventuellement un snapshot réduit pour la forme GraphQL.

### Jest UI

La couverture de rendu est large, notamment sous `frontend/js/components/User/` et `admin-next/shared/login|register`.

Risques :

- beaucoup de tests de snapshots/Enzyme qui valident la structure du composant plus que le comportement ;
- les 94 candidats UI inspectés utilisent tous un snapshot et seuls 6 contiennent également une assertion explicite de valeur ou d'interaction Jest ;
- peu de tests d'accessibilité et d'interaction sur les erreurs serveur ;
- la CI legacy ne collecte que `frontend/**/*-test.tsx` : les fichiers `-test.ts`, notamment `frontend/js/redux/modules/user-test.ts`, ne sont pas inclus par le glob CircleCI actuel ;
- les tests UI ne doivent pas devenir le seul endroit où sont encodées la complexité de mot de passe ou les transitions de compte.

### Cypress

Les scénarios sont utiles comme tests de contrat utilisateur. L'appel HTTP à `/login_check` peut rester un black box si cette route est volontairement stable.

Problèmes constatés :

- `cypress/e2e/frontOfficeWorkflow/proposalSelectionVoteWorkflow.cy.ts` contient un `it.only`, trois blocs/tests `skip` et plusieurs mutations SQL directes ;
- `cypress/e2e/frontOfficeWorkflow/proposalCollectVoteWorkflow.cy.ts` contient cinq blocs/tests `skip` ;
- `cypress/e2e/frontOffice/rgpd/rgpd.cy.ts` et `cypress/e2e/frontOffice/shield.cy.ts` n'appellent pas `db:restore`, contrairement à l'ADR frontend ;
- les helpers valident le nom de cookie `PHPSESSID`, qui n'est pas un résultat fonctionnel ;
- les workflows de plus de 1 000 lignes cumulent setup, réconciliation, exigences et ranking, ce qui rend les échecs difficiles à diagnostiquer.

Action : supprimer les exclusivités, décider explicitement du sort de chaque test ignoré, découper les workflows par règle métier et déplacer les matrices algorithmiques vers PHPUnit. Cypress doit conserver quelques parcours représentatifs de bout en bout.

### PHPSpec et Behat

- PHPSpec est installé directement, compte 239 specs et est exécuté par le job CircleCI `unit-php` ;
- aucun fichier `.feature` ni configuration Behat n'a été trouvé ;
- `behat/behat` n'apparaît que comme dépendance transitive de PHPSpec dans `composer.lock`.

La migration des contrats PHPSpec User/Participant relève de cet audit. La migration des autres domaines et le retrait global de l’infrastructure PHPSpec/Behat restent hors périmètre.

## Matrice de couverture cible

Légende : **OK** = filet substantiel, **partiel** = happy path ou couche unique, **manquant** = pas de test de contrat identifié.

| Contrat | Unitaire/service | API/intégration | E2E | Améliorations des tests envisagées |
|---|---|---|---|---|
| Inscription locale | PHPSpec couplé | Jest GraphQL | Cypress | Partiel : migrer et compléter erreurs/atomicité |
| Login/logout local | PHPSpec partiel | faible | Cypress | Partiel : ajouter matrice états de compte |
| Confirmation d'adresse e-mail | PHPSpec couplé | Jest partiel | Cypress happy path | Partiel : invalidité, expiration, replay |
| Changement d'adresse e-mail | PHPSpec couplé | Jest | Cypress | Partiel : collision et rollback |
| Reset/changement de mot de passe | PHPSpec + Jest UI | faible | Cypress happy path | Manque backend du cycle des jetons |
| Magic link | PHPSpec couplé | faible | Cypress via workflow | Manque contrôleur/mutation et replay |
| User entity/invariants | quasi absent | indirect | indirect | **Manquant** |
| Participant entity/invariants | absent | partiel | workflows | **Manquant** |
| Réconciliation proposals/replies | PHPUnit | indirect | Cypress | Correct mais incomplet |
| Réconciliation votes/contributions | absent | indirect | Cypress partiellement ignoré | **Manquant** |
| OAuth/OpenID/FranceConnect | PHPUnit couplé à FOS | Jest config | faible | Bon socle, à découpler |
| CAS | PHPSpec | Jest config | absent | Partiel, migrer |
| SAML | absent | absent | absent | **Manquant** |
| Groupes/types/rôles | PHPSpec + PHPUnit | Jest | Cypress | Partiel : invariants et refus |
| Téléphone User | PHPSpec | Jest | workflows | Partiel, migrer |
| Téléphone Participant | absent | indirect | workflows | **Manquant** |
| Suppression/anonymization | PHPUnit + PHPSpec | Jest | Cypress | Bon socle, isoler UserAnonymizer |
| Archive personnelle | PHPUnit | Jest | absent | Correct |
| Notifications/consentements | partiel | Jest | Cypress partiel | Partiel |
| Exports User/Participant | PHPUnit intégration | n/a | n/a | Correct, réduire couplage fixtures |
| Profil public et contenu associé | PHPSpec/Jest UI | Jest queries | Cypress | Correct en lecture |

## Plan de remise en état des tests actualisé

> Plan mis à jour le 30 septembre 2026 sur la branche `20284-users-phpspec-migration`.
> L'inventaire et la matrice ci-dessus décrivent l'état initial du 25 septembre ; ils ne constituent pas un nouvel audit de la branche après migration.

### Partie 1 — Migration du périmètre identité de PHPSpec vers PHPUnit — réalisée

Les contrats existants du périmètre User/identité ont été déplacés vers PHPUnit : mutations de compte, confirmation, magic link, invitations, providers et handlers, autorisations, requirements et resolvers. Les specs sans contrat métier utile ont été supprimées.

Cette partie fournit un socle PHPUnit : les mutations traversent les vrais formulaires et services de compte par HTTP, et vérifient le hash et les effets SQL après rechargement. À l’issue du lot initial, `UserTest` restait limité aux contributions et les parcours complémentaires de la partie 2 restaient à couvrir ; les ajouts et validations de cette partie sont décrits dans son compte rendu.

Le retrait global de PHPSpec reste hors périmètre : des specs d’autres domaines subsistent, ainsi que la dépendance Composer et son exécution en CI.

### Hygiène CI — à traiter rapidement en parallèle des parties suivantes

1. Vérifier en revue les tests focalisés (`it.only`, `describe.only`, `test.only` et leurs équivalents) et retirer les exclusivités du périmètre. Aucune garde dédiée en CJS n’est ajoutée, à la demande de l’utilisateur.
2. Les `.skip` des workflows User/Participant sont retirés dans la partie 3, avec leurs décisions de remplacement/suppression documentées ci-dessous.
3. Corriger le glob CircleCI Jest legacy pour exécuter aussi les fichiers `-test.ts`.
4. Ajouter `db:restore` à `shield.cy.ts`; sortir `rgpd.cy.ts` du périmètre User si seuls les cookies sont visés, sinon l'isoler conformément à l'ADR frontend.
5. Vérifier que la CI découvre et exécute effectivement les nouveaux tests de chaque partie.

#### Revue après la décision PHPUnit du 2 octobre 2026

Les 57 fichiers PHPUnit touchés par la partie 1 (53 classes de tests et quatre
socles) ont été relus selon
[`ADR/001-phpunit_tests.md`](ADR/001-phpunit_tests.md) et ses guides :

- les règles de droits, l'activité, l'agrégation des contributions, l'encodage et la
  sérialisation publique utilisent des objets métier réels ; les assertions de
  câblage, les appels internes attendus et la réflexion ont été retirés ;
- les contrôleurs et listeners, les mutations, les résolveurs dépendant de SQL et
  les parcours de session passent par HTTP. Les effets sont relus après `clear()` ;
- les liens de compte sont suivis par HTTP pour vérifier leur destination et leur
  effet réel, au lieu d'attendre un appel au routeur ;
- les erreurs de fournisseur, refus, limites et ressources voisines sont vérifiés.
  La correspondance des statuts Mailjet/Mandrill reste un contrat unitaire sur un
  message réel ; elle ne prétend pas prouver une persistance SQL ;
- `IdentityWebTestCase`, `ResponseVisibilityWebTestCase` et `OAuthLogoutWebTestCase`
  isolent SQL par transaction, restaurent les flags et l'environnement, et
  remplacent les frontières externes (messagerie, mail et SSO/SMS).
  La recherche des publications utilise de vrais documents Elasticsearch, indexés
  pour la préparation puis supprimés et rafraîchis après chaque scénario.
  L’indexation déclenchée par l’application reste neutralisée : ces tests ne la valident pas.
  Les clés Redis de limitation et les CSV temporaires sont nettoyés explicitement.

Les tests GraphQL PHPUnit protègent ici la persistance et la sélection réelle des
identités, la confidentialité des réponses, les consentements et les sessions.
Ils complètent les contrats API Jest existants pour ces risques d'intégration.
Le contexte interne `disable_acl` reste testé par la méthode publique de la règle
avec de vraies réponses. Le contrôle de type `supportsClass` du provider CAS et
les getters/setters sans règle métier ne sont pas conservés comme contrats.

Les scénarios SMS et de limitation construisent uniquement le service concerné
avec un environnement fournisseur, car la production contourne ces comportements
en environnement `test`. Le kernel HTTP reste en environnement de test et aucun
appel réseau fournisseur n'est exécuté. Ce choix ne valide pas les services tiers.

La revue complémentaire vérifie le filtre propriétaire, la recherche, le tri et
la pagination des publications sans mock de `PostSearch`. Elle ajoute les refus
sur un questionnaire voisin et la conservation d’un compte voisin pendant
l’anonymisation. Les refus de confirmation et de suppression sont des scénarios
indépendants ; les erreurs de mot de passe sont vérifiées par leur code explicite.
La lecture d’une session inactive est couverte par son résultat public, sans
assertion sur les appels de verrouillage Redis. Les doubles de lecture des
fournisseurs sont des stubs ; seuls les effets externes observables restent mockés.
Le nettoyage des CSV, des flags, de SQL et d’Elasticsearch fonctionne aussi en cas
d’échec d’une assertion.

Les fichiers sont marqués `compliant` après cette revue, sans promotion en référence.
La découverte reste celle de `tests/**/*Test.php`, sans nouvelle exclusion.

Validation de cette revue : les 235 scénarios concernés passent avec 2 627
assertions en ordre aléatoire (seed `20284`). La suppression temporaire du filtre
propriétaire fait échouer les deux scénarios de recherche attendus ; le code
applicatif est restauré après cette vérification. PHPStan, PHP CS Fixer et Rector
passent dans le conteneur applicatif.

#### Revue complémentaire du 5 octobre 2026

Le périmètre reste celui des 53 classes migrées et des quatre socles PHPUnit,
identifiés par le diff de la branche avec `preprod`. Aucun fichier de test Jest
n'est modifié par cette migration ; son ADR précise le choix de frontière pour
les contrats GraphQL, dont les risques d'intégration distincts sont décrits ci-dessus.

Les écarts résiduels corrigés concernent :

- les variantes d'identité, de rôle d'organisation, d'affectation, de statut de
  revue, de flag et de contexte ACL : des providers nommés fournissent uniquement
  des valeurs, et chaque scénario crée ses propres objets métier ;
- les sessions authentifiées : la connexion et les liens de confirmation,
  d'archive et de magic link vérifient aussi l'identifiant du compte connecté ;
- les refus de magic link : le statut, la destination et le message public
  `invalid-token` sont explicites, en complément de l'absence de session ;
- les payloads : l'identifiant de l'argument supprimé est vérifié selon le type
  public `DebateArgument`, et le provider des réponses requises exprime le préfixe
  d'erreur réellement attendu ;
- l'isolation Redis : le socle conserve et restaure les objets de configuration
  des flags, y compris leur absence ou leurs conditions, et supprime les sessions
  créées par les requêtes, même après une assertion en échec.

La découverte avec la configuration PHPUnit habituelle retrouve les 53 classes.
Une suppression temporaire de l'identifiant d'argument dans le payload fait
échouer le scénario concerné ; il passe de nouveau après restauration du code
applicatif.

Validation finale : 253 scénarios et 2 108 assertions passent en ordre aléatoire
(seed `20285`). L'empreinte de la configuration Redis des flags est identique
avant et après l'exécution, et aucune nouvelle session Redis de test ne subsiste.
PHPStan, PHP CS Fixer et Rector passent dans le conteneur applicatif.

#### Vérification de la préservation des contrats PHPSpec — 5 octobre 2026

La comparaison avec les specs supprimées retrouve des contrats métier omis malgré
les marqueurs `compliant`. Dix fichiers de tests sont complétés, sans modification
du comportement applicatif :

- refus d'un code SMS expiré et absence de confirmation persistée ;
- collision d'adresse e-mail pour un compte FranceConnect sans mot de passe :
  aucune création de mot de passe, aucun changement d'adresse ni message envoyé,
  et conservation du compte possédant déjà l'adresse ;
- droits du propriétaire d'un projet sur ses propositions et publications,
  suppression d'une publication ou liste de diffusion par le créateur membre
  de l'organisation, et protection des listes non supprimables ;
- droits d'affectation des propriétaires, superviseurs et analystes, refus
  d'évaluation par un utilisateur non affecté, et visibilité des événements
  selon leur revue ;
- réponses du profil visibles à l'auteur, à un autre compte ou à un visiteur
  anonyme, avec rechargement de Doctrine avant la requête pour ne pas lire une
  collection conservée en mémoire pendant la préparation ;
- activation du compte à la confirmation, publication SQL des contributions
  lors des deux types de confirmation, conservation des contributions d'un compte
  voisin et refus d'un jeton Participant inconnu ;
- autorisation d'anonymiser un autre super-administrateur pour un
  super-administrateur, avec conservation du compte demandeur et de sa session ;
- absence de lien de confirmation d'inscription après consommation du jeton.

Les variantes utilisent des providers nommés contenant uniquement des valeurs.
Les effets HTTP sont relus après `clear()` et les ressources restent prises en
charge par les transactions et nettoyages existants. Les tests de publication
vérifient SQL ; l'indexation applicative reste neutralisée comme décrit plus haut.

Les suppressions sans remplacement de `CasHandlerSpec` et `CapebUserFilterSpec`
sont justifiées : le premier ne conservait qu'un scénario actif d'initialisation ;
le second appelait un client Guzzle simulé sans exercer `CapebUserFilter` ni
vérifier de résultat métier.

La persistance prématurée d'un mot de passe avant le refus d'une adresse
FranceConnect a été introduite temporairement : le nouveau scénario échoue sur
le mot de passe relu en base. Le code applicatif a ensuite été restauré.

Validation : les 53 classes migrées sont découvertes par la configuration PHPUnit
habituelle. Les 280 scénarios migrés et un scénario du contrôleur de confirmation
voisin passent ensemble : 281 tests, 2 302 assertions, ordre aléatoire avec la seed
`20290`. Le nouveau scénario FranceConnect passe également seul après restauration
du code. PHPStan, PHP CS Fixer et Rector passent dans le conteneur applicatif.

#### Seconde passe de préservation et d'isolation — 5 octobre 2026

La comparaison complémentaire avec les specs supprimées et le contrôle du
nettoyage font ressortir cinq corrections :

- les commentaires connectés vérifient à nouveau l'auteur persisté, l'absence
  de jeton de confirmation et le statut de modération, pour un compte ordinaire
  et un administrateur ; les refus anonymes ne produisent ni commentaire ni message ;
- l'envoi SMS accepte encore une tentative après un seul SMS récent et après
  deux SMS anciens ; les SMS récents d'un compte voisin ne consomment pas la limite
  du demandeur et restent conservés ;
- le JSON de session conserve les indicateurs de rôle et l'organisation pour
  six profils réels, ainsi qu'une date d'activité courante ; la lecture préserve
  aussi une session encore active ;
- le socle supprime désormais les sessions Redis enregistrées pendant la
  préparation, avant toute réponse HTTP. Une sonde temporaire reproduit la fuite
  avec `loginUser()`, puis confirme le nettoyage après correction, y compris
  lorsqu'une assertion du scénario échoue ;
- le rôle administrateur du test de recherche de réponse à un questionnaire
  est explicitement persisté avant la connexion, sans dépendre d'un flush du login.

Les providers contiennent uniquement des valeurs ; les commentaires et SMS sont
relus en base après vidage de Doctrine. Aucun comportement applicatif n'est modifié.
Une limite SMS temporairement ramenée de deux tentatives à une fait échouer le
nouveau scénario de relance ; le code applicatif est ensuite rétabli. La sonde
de nettoyage est retirée après la vérification.

Validation : la configuration PHPUnit habituelle découvre les 53 classes et
leurs 291 scénarios. Ils passent tous en ordre aléatoire (seed `20292`) :
291 tests et 2 558 assertions. Les 26 scénarios de commentaire, SMS et session
passent également dans une exécution ciblée (seed `20291`). PHPStan, PHP CS Fixer
et Rector passent dans le conteneur applicatif ; `git diff --check` ne signale
aucun défaut.

#### Troisième passe des effets métier et des frontières externes — 5 octobre 2026

Quatre points supplémentaires sont corrigés :

- les scénarios de suppression distinguent désormais l'anonymisation du compte
  de l'anonymisation avec effacement du contenu associé : suppression SQL du
  contenu amovible, remplacement des textes d'une structure conservée, et maintien
  du contenu d'un autre auteur. Les refus couvrent les deux types et vérifient
  aussi l'identifiant du compte protégé dans le payload ;
- le scénario de données personnelles sans `userId` de l'ancienne spec est
  rétabli avec vérification SQL du nom et de l'e-mail, conservation du téléphone
  confirmé et protection d'un compte voisin. La matrice ajoute le super-administrateur
  modifiant ses propres données et vérifie le compte retourné ainsi que l'absence
  de modification du demandeur lorsqu'il agit sur un autre compte ;
- les doubles Mailjet et Mandrill vérifient à nouveau le message ciblé par la
  requête et l'absence d'appel à l'autre fournisseur. Plusieurs identifiants
  distincts évitent qu'un identifiant fixe passe inaperçu ; les statuts Mailjet
  `opened` et `clicked` sont aussi distingués d'un échec. Les assertions portent
  sur cette frontière externe et sur le statut métier, sans compter les appels
  Doctrine ni prétendre vérifier la persistance SQL du notifier ;
- une suppression `HARD` ajoutait encore l'identifiant du compte à la file Redis
  `recalculate_user_counters` après le rollback SQL. Le socle enregistre les comptes
  créés par son helper et retire uniquement ces membres lors du nettoyage, dans
  un `finally`. Une sonde temporaire reproduit la fuite, puis vérifie le nettoyage
  après une exécution normale et après un échec volontaire d'assertion, tout en
  conservant un membre voisin. La sonde est ensuite retirée.

Deux régressions sont introduites temporairement : exécuter le comportement
`SOFT` pour une demande `HARD`, puis interroger un identifiant Mailjet fixe.
Les tests renforcés échouent respectivement sur la présence du contenu en SQL
et sur le message demandé au fournisseur. Le code applicatif est rétabli.

Validation : les 23 scénarios ciblés passent seuls en ordre aléatoire (seed
`20293`), puis les 53 classes migrées passent ensemble : 298 tests et 2 689
assertions, seed `20294`. La configuration PHPUnit habituelle découvre ces 298
scénarios. PHPStan, PHP CS Fixer et Rector passent dans le conteneur applicatif ;
`git diff --check` ne signale aucun défaut.

#### Quatrième passe des refus et de la discrimination — 5 octobre 2026

Cette passe complète des matrices de refus qui restaient limitées au visiteur
anonyme, même lorsque les scénarios PHPSpec nominaux étaient conservés :

- les arguments et opinions de débat distinguent désormais un auteur, un compte
  connecté sans droit et un administrateur. Le droit de supprimer un argument
  n'autorise pas l'administrateur à le modifier ; la fermeture du débat bloque
  aussi sa participation. Les attributs inconnus sont testés avec un sujet reconnu,
  et les arguments anonymes ne supportent pas les actions de modification/suppression ;
- les commentaires d'analyse autorisent l'analyste ayant rédigé l'analyse,
  le superviseur et le décideur concernés, mais refusent un compte extérieur ou
  un analyste simplement affecté à la proposition. Les identités réelles ont des
  identifiants distincts pour ne pas dépendre de l'égalité d'objets non initialisés ;
- les exigences de profil couvrent les valeurs absentes et vérifient un champ
  JSON nommé, sans dépendre de l'ordre des champs. Un consentement explicitement
  faux reste faux malgré l'existence de sa ligne SQL ; les consentements d'un autre
  compte et ceux donnés à une autre exigence ne satisfont pas l'exigence demandée ;
- les magic links malformés et les liens dont l'e-mail a été modifié sans refaire
  la signature sont refusés par HTTP, avec la destination et le message publics
  attendus, sans session authentifiée.

Les providers contiennent uniquement des valeurs et les règles d'autorisation
utilisent des objets métier réels. Trois régressions temporaires font échouer les
nouveaux scénarios : accorder la modification d'un argument à un administrateur
non auteur, supprimer la vérification de signature JWT, et assimiler une ligne
de consentement à une acceptation indépendamment de sa valeur. Le code applicatif
est ensuite rétabli.

Validation : les 39 scénarios ciblés passent après restauration du code (seed
`20295`). Les 53 classes migrées et leurs 315 scénarios sont découvertes par la
configuration PHPUnit habituelle et passent ensemble en ordre aléatoire :
315 tests et 2 826 assertions, seed `20296`. PHPStan, PHP CS Fixer et Rector
passent dans le conteneur applicatif ; `git diff --check` ne signale aucun défaut.

#### Cinquième passe des invitations, du téléphone et de CAS — 5 octobre 2026

Cette passe renforce trois scénarios dont les seules données nominales pouvaient
laisser passer une régression :

- l'acceptation d'une invitation d'organisation vérifie la connexion automatique
  du destinataire anonyme, le rôle membre ou administrateur enregistré en SQL,
  et la conservation de la session du destinataire déjà connecté. Un autre compte
  ou un jeton inconnu est refusé sans créer d'adhésion ; l'invitation voisine reste
  disponible avec son rôle et son destinataire ;
- la vérification du téléphone départage deux SMS du compte et un SMS plus récent
  d'un autre compte, avec des dates fixes. Seul le dernier SMS du bon compte est
  approuvé. Les erreurs conservent les statuts SQL initiaux et ne renvoient aucun
  compte dans le payload ; le succès renvoie l'identité du compte vérifié. Le
  téléphone et son état de confirmation restent inchangés pour le compte voisin,
  y compris en cas de collision ;
- l'authentification CAS couvre aussi un compte déjà rattaché dont le profil a
  été modifié. Les deux requêtes authentifiées conservent son identité, son nom,
  son adresse et son mot de passe persistés, sans doubler le compte ni l'adhésion
  au groupe CAS. La première réponse HTTP identifie également le bon compte.

Les contrôles SQL passent par des lectures après `EntityManager::clear()` ;
les providers restent composés de valeurs. Les doubles remplacent uniquement
les frontières externes, avec l'isolation SQL, Redis et des feature flags du socle
existant. Aucun code applicatif permanent ni contrat Jest n'est modifié.

Trois régressions temporaires font échouer les scénarios attendus : forcer le rôle
d'organisation à `user`, sélectionner le SMS le plus ancien, et réinitialiser le
profil d'un compte CAS existant. Le code applicatif est ensuite rétabli.

Validation : les 13 scénarios ciblés passent en ordre aléatoire (seed `20297`).
La configuration PHPUnit habituelle découvre les 53 classes migrées et leurs
320 scénarios. Après restauration du code applicatif, ils passent ensemble en
ordre aléatoire : 320 tests et 2 989 assertions, seed `20298`. PHPStan,
PHP CS Fixer et Rector passent dans le conteneur applicatif ; `git diff --check`
ne signale aucun défaut.

### Partie 2 — Caractérisation du compte et de l'authentification locale — réalisée

**Objectif : caractériser et fiabiliser les tests du cycle de compte local, avec les services de production existants.**

#### 2.1 — Règles du compte

Ajouter des tests PHPUnit ciblés sur les comportements réellement présents :

- rôles par défaut, déduplication et règles de hiérarchie à leur couche effective ;
- identité de sécurité et comportement des comptes désactivés, non confirmés, verrouillés, supprimés ou anonymisés, selon les états effectivement utilisés ;
- canonicalisation de l'adresse e-mail et du nom d'utilisateur, notamment les collisions après normalisation ;
- transitions de confirmation et cycle de vie des jetons de compte.

Placer les tests à la couche qui porte la règle : entité pour un invariant local, service ou intégration pour la canonicalisation, l'authentification ou la persistance. Distinguer les comportements existants à préserver des comportements souhaités mais absents ; ne pas modifier implicitement les règles produit pour satisfaire une nouvelle matrice.

#### 2.2 — Parcours fonctionnels backend

Ajouter des tests HTTP/GraphQL traversant les vrais formulaires, services de compte et mécanismes de persistance pour :

- inscription → confirmation d'adresse e-mail → connexion → déconnexion ;
- changement et réinitialisation du mot de passe ;
- changement d'adresse e-mail ;
- demande et utilisation d'un magic link.

Vérifier explicitement les réponses HTTP/GraphQL, les codes d'erreur, l'état persisté et la possibilité effective de se connecter avec les nouveaux credentials. Pour la déconnexion, vérifier la perte d'accès authentifié plutôt que le nom du cookie de session.

Prioriser les cas de refus : collision d'adresse e-mail, mauvais mot de passe actuel, validation serveur du nouveau mot de passe, jeton invalide, expiré ou réutilisé, et états de compte empêchant l'accès. Caractériser également la rotation des jetons, les limites de demandes, les réponses aux adresses inconnues et l'invalidation des sessions lorsqu'elles existent. Toute absence d'un comportement attendu doit être signalée et faire l'objet d'une décision séparée.

#### 2.3 — Indépendance et exécution du filet de tests

- Préparer des données déterministes et isolées. Les objets, repositories, helpers et SQL direct sur le schéma conservé sont possibles ; choisir la préparation adaptée au contrat vérifié, sans imposer le retrait de `fos_user`.
- Utiliser des assertions explicites sur les résultats et effets persistés, avec des snapshots réduits seulement s'ils apportent un contrat de forme utile.
- Ne pas importer ni mocker FOS dans les nouveaux tests. Réduire les dépendances historiques sur ce périmètre quand cela ne nécessite pas de refonte de production.
- Conserver les URL publiques, telles que `/login_check` et `/logout`, si leur stabilité est un contrat choisi ; éviter de figer les noms de routes internes FOS.
- Exécuter ce filet avec FOS avant son remplacement et vérifier sa découverte en CI.

Ne pas créer une famille d’interfaces `AccountManager`, `AccountPasswordHasher`, `AccountTokenGenerator` ou `AccountAuthenticator` pour écrire ces tests. Ce travail utilise les services de production existants et vérifie leurs contrats publics.

**Critères de sortie de la partie 2 :** les parcours locaux ci-dessus et leurs principaux refus sont protégés par des assertions fonctionnelles explicites ; les tests exercent la validation, le hash et la persistance réels ; les lacunes de comportement découvertes sont documentées ; la CI exécute le filet. Ces tests doivent protéger les comportements existants sans imposer une modification de production.

### Partie 3 — Participant et réconciliation — implémentée et validée localement

Ajouter les tests unitaires de `Participant`, `ContributionsReconcilier` et `VotesReconcilier`. Couvrir les conflits entre identités, l'idempotence, les limites/budget/ranking et l'absence de perte de contenu associé. Compléter les codes d'erreur des mutations Participant, notamment suppression et vérification du téléphone.

Réduire ensuite les gros scénarios Cypress à quelques parcours représentatifs, avec une décision explicite pour les cas ignorés et une préparation déterministe, restaurée, compatible avec le schéma SQL conservé.

### Partie 4 — SSO — filet minimal réalisé, validation locale le 6 octobre 2026

Découpler les tests OAuth des interfaces FOS, compléter les contrats CAS et ajouter SAML ainsi que les callbacks complets. Utiliser des réponses fournisseur figées et vérifier le compte créé ou rattaché, la session et la redirection, y compris les collisions d'adresse e-mail et les refus du fournisseur.

La migration des specs CAS/handlers du périmètre identité appartient déjà à la partie 1 ; cette partie vise leur couverture manquante et leur indépendance au vendor.

### Partie 5 — Isolation et assertions des tests User dans PHPUnit et Jest GraphQL — validation locale du 6 octobre, simplification Jest le 7 octobre 2026

**Lot retenu le 6 octobre 2026, puis corrigé après clarification du périmètre**, sur la branche `20284-user-counter-tests-decoupling`, créée depuis `preprod`. Le lot d’hygiène est suivi en partie 6 ; la validation finale des tests User/Participant est suivie en partie 7.

Le lot comprend une suite PHPUnit, quatre suites Jest GraphQL et cet audit. Le code de production reste inchangé. L'ancienne approche retirant le SQL User reposait sur l'hypothèse erronée d'un changement de schéma. La reprise conserve les améliorations utiles et rétablit les accès au stockage existant ; les validations de ce résultat sont documentées ci-dessous.

#### 5.1 — Recalcul des compteurs User en PHPUnit — vérifications SQL rétablies

Conserver les améliorations de `RecalculateUsersCountersCommandTest` : données déterministes, absence de skip, exécution de la vraie commande CLI, compte voisin hors file, mode `--force`, consommation de la file et nettoyage après échec.

Périmètre corrigé :

- conserver ou réintroduire les préparations et lectures SQL utiles sur `fos_user`, notamment pour contrôler les quatre compteurs persistés ; leur présence ne dépend pas du bundle PHP ;
- préserver les valeurs attendues explicites et les données propres à chaque scénario, sans revenir à la sélection du premier utilisateur ou d'un compteur quelconque dans les fixtures ;
- garder le rollback SQL et le namespace Redis propre à chaque scénario ;
- garder les assertions depuis CLI et le statut de conformité seulement si l'isolation et les preuves de persistance restent assurées après l'ajustement.

**Critères de sortie :** aucun scénario ignoré, effets persistés contrôlés sur le schéma conservé, compte voisin préservé, état SQL/Redis restauré même en cas d'échec. La suite doit passer seule et en ordre aléatoire dans le conteneur applicatif, rester découverte par PHPUnit/CircleCI et satisfaire les contrôles PHP globaux avant commit. L'absence de SQL sur `fos_user` n'est plus un critère.

#### 5.2 — Préparations et assertions Jest GraphQL — SQL rétabli, helpers Doctrine retirés

Le périmètre reste `Other/register.js`, `askProposalRevision.js`, `Mediator/addMediatorVotes.js` et `Mediator/updateMediatorVotes.js`, sous `features/graphql-api/internal/Mutation/`.

Périmètre corrigé :

- conserver ou réintroduire les préparations SQL sur `fos_user` pour l'absence d'e-mail et les téléphones confirmés, ainsi que les lectures SQL utiles pour vérifier le pseudo réellement stocké après inscription ;
- retirer `_userFixtures.js` et `_userFixtures.php`, introduits uniquement pour remplacer ces accès SQL, en rétablissant les préparations explicites des scénarios, y compris l'absence d'auteur d'une proposition ;
- garder les assertions explicites sur les codes de refus, les valeurs nettoyées et les effets persistés ; les relectures API peuvent compléter les vérifications de stockage lorsqu'elles protègent un contrat distinct ;
- garder les restaurations MySQL/Elasticsearch avant chaque test ;
- conserver les invocations Fabric compatibles avec la CI et les environnements des autres développeurs.

**Critères de sortie :** scénarios et snapshots utiles préservés, préparations SQL lisibles et état MySQL/Elasticsearch restauré avant chaque test, assertions de résultat maintenues, aucune dépendance directe aux classes ou interfaces PHP FOS ajoutée. Valider les quatre suites dans leur version corrigée ; les validations de l'ancienne implémentation ne suffisent pas à valider ce résultat.

La migration du vendor appartient au chantier séparé `18981-remove-fos-user`. Les anomalies produit caractérisées nécessitent leurs propres décisions et corrections ; les erreurs publiques FOS et le schéma SQL ne sont pas renommés dans cet audit.

### Partie 6 — Hygiène et exécution CI des suites User/Participant — implémentée localement le 7 octobre 2026, CI distante à confirmer

La répartition des fichiers Jest legacy `-test.ts` et la restauration initiale de `shield.cy.ts` sont ajoutées. Le test focalisé de recherche est réactivé ; la garde dédiée en CJS est retirée à la demande de l’utilisateur. `rgpd.cy.ts` est classé hors du périmètre User : ses assertions concernent les cookies du navigateur, pas les consentements persistés du compte. Les cas ignorés résiduels, la dépendance à la PR #20296 pour les environnements Cypress/admin-next et les vérifications de découverte sont documentés dans le compte rendu de la partie 6 ci-dessous.

Le problème de build d'assets documenté dans la partie 3 doit être vérifié avec la configuration par défaut ; s'il subsiste, sa correction fera l'objet d'un lot dédié. Ce lot ne constitue pas encore le quality gate global de suppression.

### Partie 7 — Validation finale des tests User/Participant — à réaliser après clôture de l’hygiène

Rejouer les suites User/Participant concernées en PHPUnit, Jest GraphQL, Jest UI et Cypress, vérifier les critères de clôture ci-dessous et confirmer leur exécution réelle en CI. Distinguer la découverte, les résultats locaux et les résultats distants. Documenter les exceptions et lacunes de couverture restantes, ainsi que les comportements produit caractérisés qui nécessitent une décision séparée.

Le plan de cet audit s’arrête à la remise en état de ces tests. La migration PHPSpec des autres domaines, le retrait global de son infrastructure et la suppression de FOSUserBundle sont hors périmètre. La stack de 11 branches du chantier `18981-remove-fos-user` sera reprise plus tard.

## Résultats de la partie 2 — 30 septembre 2026

La branche `20284-users-local-auth-tests` ajoute six suites concrètes dans `tests/UserBundle/Functional` et complète `tests/UserBundle/Entity/UserTest.php`. Les suites HTTP/GraphQL traversent le kernel Symfony et utilisent les vrais formulaires, validateurs, gestionnaire de comptes, hash, persistance et sécurité de session. Les sorties mail, messages et indexation sont remplacées ; les clés RSA du magic link sont générées pour le test.

Les tests couvrent les parcours locaux du plan, leurs refus, la canonicalisation, la hiérarchie des rôles, la consommation/rotation des jetons de confirmation et de changement d'e-mail, ainsi que deux sessions distinctes. Ils ne contiennent ni import/double FOS, ni SQL sur la table historique, ni attente sur un nom de cookie. Le refus de changement de mot de passe vérifie désormais le code d’erreur public `fos_user.password.not_current`, actuellement renvoyé par l’API pour les deux erreurs de validation ; une migration qui change ce contrat devra adapter cette assertion.

Chaque test web utilise une transaction annulée en teardown, avec vérification que toutes les requêtes restent dans cette transaction, et restaure les feature flags modifiés. La suite d'inscription rend les questions personnalisées existantes facultatives dans sa transaction pour isoler le contrat de compte. Le détail du setup et des frontières se trouve dans `tests/UserBundle/Functional/README.md`.

### Comportements observés nécessitant une décision séparée

Ces résultats décrivent le comportement actuel. Les tests nommés `CharacterizationGap` servent à le rendre visible pendant la migration ; **ils ne font pas de ces lacunes des exigences produit à conserver indéfiniment**. Aucune correction de production n'est incluse dans cette partie.

| Observation vérifiée | Conséquence pour la suite de la migration |
|---|---|
| L'inscription refuse un mot de passe vide/trop court, mais accepte des mots de passe sans chiffre, sans majuscule ou sans minuscule. | Décider d'appliquer réellement la complexité à l'inscription ; son groupe de validation actuel diffère de celui du changement/reset. |
| La connexion locale accepte les comptes désactivés et verrouillés avec une session utilisable. | Décider et harmoniser les contrôles d'état du compte. |
| Un compte non confirmé reçoit HTTP 200 avec `success: false`, et reste anonyme. Un compte portant seulement le marqueur supprimé reçoit `success: true`, mais sa session est rejetée à la requête suivante. | Préserver la distinction entre statut HTTP, résultat de connexion et accès effectif ; décider si la réponse du compte supprimé doit évoluer. |
| Le contrôleur HTTP refuse un jeton de reset expiré, mais la mutation GraphQL l'accepte. | Harmoniser le contrôle d'expiration entre les deux points d'entrée. |
| Les resets HTTP et GraphQL conservent le jeton, qui peut être rejoué. Une demande après expiration réutilise également le jeton existant. | Décider de la consommation et de la rotation des jetons de reset. |
| Un jeton de confirmation d'e-mail reste utilisable un an après l'envoi. Il est consommé après confirmation. | Décider d'une durée de validité pour la confirmation, distincte de la consommation déjà présente. |
| Le magic link rejette une signature invalide et un jeton expiré, mais un lien valide reste rejouable après déconnexion. Il permet aussi une session pour les comptes désactivés, verrouillés ou non confirmés. | Décider de l'usage unique et des contrôles d'état du compte sur ce parcours. |
| Une seconde session reste authentifiée après changement du mot de passe. L'account anonymization invalide cette session et empêche une nouvelle connexion avec l'ancienne adresse. | Décider de la révocation des sessions lors du changement/reset de mot de passe. |
| La canonicalisation du gestionnaire transforme la casse, mais conserve les espaces des valeurs fournies directement au modèle. | Ne pas confondre canonicalisation et nettoyage effectué par les formulaires. |

Les demandes de reset pour une adresse connue/inconnue ont la même redirection publique ; le renvoi immédiat du reset n'envoie pas de nouveau mail. La demande de magic link pour une adresse inconnue renvoie le même `errorCode: null` sans publication ni création de compte. Le changement d'e-mail conserve l'ancienne adresse jusqu'à confirmation, remplace le jeton lors d'une nouvelle demande et consomme le jeton confirmé.

### Validation et découverte CI

Validation locale historique du commit `41916055f3` : **55 tests / 975 assertions** dans les nouvelles suites, avec rejeu en ordre aléatoire (seed `20260930`), et **32 tests / 122 assertions** dans les suites existantes directement concernées, dont les invariants `User`. PHPStan, PHP-CS-Fixer en dry-run et Rector en dry-run sont validés sur les fichiers PHP ajoutés/modifiés. Les trois commandes globales exigées par `AGENTS.md` avant un commit PHP ont également été exécutées avec succès dans `capco_application_1`.

```bash
# Suite du cycle local ; à rejouer pour vérifier l'isolation
docker exec -w /var/www capco_application_1 bin/phpunit tests/UserBundle/Functional

# Rejeu dans un ordre différent
docker exec -w /var/www capco_application_1 bin/phpunit tests/UserBundle/Functional --order-by=random --random-order-seed=20260930

# Suites existantes directement concernées (inclut les invariants User)
docker exec -w /var/www capco_application_1 bin/phpunit tests --filter '(RegisterMutationTest|UpdateProfilePasswordMutationTest|UpdateProfileAccountEmailMutationTest|ConfirmationControllerTest|MagicLinkAuthenticatorTest|UserInvitationHandlerTest|AuthenticationHandlerTest|UserTest)::'

# Invariants du modèle seuls
docker exec -w /var/www capco_application_1 bin/phpunit tests/UserBundle/Entity/UserTest.php

# Analyse des fichiers ajoutés/modifiés
docker exec -w /var/www capco_application_1 php -d memory_limit=-1 bin/phpstan analyse tests/UserBundle/Functional tests/UserBundle/Entity/UserTest.php tests/Mutation/RegisterMutationTest.php tests/Mutation/UpdateProfileAccountEmailMutationTest.php --no-progress
docker exec -w /var/www capco_application_1 bin/php-cs-fixer fix --dry-run --diff --config=.php-cs-fixer.dist.php --path-mode=intersection tests/UserBundle/Functional tests/UserBundle/Entity/UserTest.php tests/Mutation/RegisterMutationTest.php tests/Mutation/UpdateProfileAccountEmailMutationTest.php
docker exec -w /var/www capco_application_1 bin/rector process tests/UserBundle/Functional tests/UserBundle/Entity/UserTest.php tests/Mutation/RegisterMutationTest.php tests/Mutation/UpdateProfileAccountEmailMutationTest.php --dry-run
```

Le glob CircleCI existant `tests/**/*Test.php` inclut les six nouvelles classes concrètes, et la suite PHPUnit `default` inclut leur dossier. Aucun changement CI n'est nécessaire à leur découverte. Cela vérifie la configuration de découverte, pas le résultat d'une exécution CI distante.

## Mise en conformité de la partie 2 — 5 octobre 2026

Revue de tous les changements du commit `41916055f3` selon les ADR PHPUnit/Jest et les guides de `docs/tests`. Les invariants publics de `UserTest` sont conservés : objets réels, identité de sécurité, unicité des rôles et règle de confirmation ; aucune réflexion ni assertion de câblage n'est nécessaire.

Corrections des suites fonctionnelles :

- remplacement de l'inspection du service de hiérarchie Symfony par des requêtes HTTP autorisées/refusées pour les rôles utilisateur, médiateur, administrateur de projet, administrateur et super administrateur ;
- remplacement du graphe de mocks de la mutation magic link par deux requêtes GraphQL réelles, un compte persisté et un limiteur réel avec cache isolé ; vérification du code de refus, de l'absence de nouvelle publication et du timestamp rechargé ;
- suppression des assertions sur les appels internes au cache ; l'expiration et le bypass sont vérifiés par les décisions et exceptions publiques des limiteurs ;
- erreurs d'inscription explicites par variante et vérifications ciblées des comptes après `EntityManager::clear()`, sans dépendance au nombre global de fixtures ; refus de changement d'e-mail séparés par data provider, avec contrôle du compte voisin ;
- accès authentifié vérifiant l'identité attendue, et anonymisation de la seconde session déclenchée par la mutation publique `deleteAccount` ;
- dates expirées fixes et résultats de canonicalisation écrits explicitement ;
- contrôle de l'environnement `test` avant les écritures, nettoyage des sessions Redis propres au scénario et restauration des flags/configuration même après échec ;
- conservation des diagnostics de tous niveaux dans le fichier de log du kernel au lieu du seuil global `EMERGENCY`.

Les scénarios mixtes GraphQL/HTTP restent en PHPUnit pour vérifier le lien entre mutations de compte, credentials et sessions sur la même connexion transactionnelle. Le README précise ce risque distinct et réserve les futurs contrats GraphQL autonomes au runner Jest existant. Aucune nouvelle duplication de parcours Jest n'est ajoutée.

Deux limites du contrat d'erreur actuel sont rendues explicites : le refus d'un mot de passe trop court à l'inscription expose `errorsCode: []`, et les deux refus de changement du mot de passe exposent un message opaque commun sans code métier stable. Les assertions vérifient aussi l'absence des effets interdits ; aucune correction produit n'est incluse.

Validation de la mise en conformité : **60 tests / 1 216 assertions** en ordre aléatoire (seed `20261005`), **39 tests / 514 assertions** dans les suites existantes directement concernées (commande de filtre ci-dessus), et limiteurs exécutés seuls (**4 tests / 11 assertions**). PHPStan, PHP-CS-Fixer en dry-run et Rector en dry-run passent sur `tests/UserBundle/Functional` et `tests/UserBundle/Entity/UserTest.php`. Une mutation temporaire de la borne du limiteur (`<` remplacé par `<=`) provoque bien l'échec de son test public ; le fichier de production a été restauré à l'identique. Le glob CircleCI et la découverte PHPUnit sont préservés ; aucune exécution CI distante n'est revendiquée. Les contrôles globaux pré-commit cités plus haut restent les résultats historiques du commit initial ; cette correction est laissée dans le working tree.

### Revue complémentaire de la mise en conformité

La branche contient désormais le commit réécrit `c4b3f09dbd` correspondant au travail initial de `41916055f3`. La revue complémentaire conserve les corrections déjà présentes et renforce les points suivants :

- restauration de la configuration complète des feature flags, avec leurs conditions et leur éventuelle absence initiale, plutôt que du seul booléen actif ;
- contrôle de la transaction après chaque requête, en plus du teardown ;
- expiration du limiteur provoquée par son API publique, sans préparer une clé de cache interne ;
- refus de reset séparés en cas nommés, avec comparaison du hash, du jeton et du timestamp relus en base avant et après l'action ; refus HTTP du jeton inconnu conservé dans un scénario distinct ;
- identité précise vérifiée pour la seconde session et les magic links ; absence de modification de l'adresse en attente, du jeton et du timestamp vérifiée lors des refus de confirmation et de renvoi.

Validation complémentaire : **62 tests / 1 146 assertions** dans la suite fonctionnelle en ordre aléatoire (seed `20261005`), **39 tests / 514 assertions** dans les suites existantes directement concernées, et **4 tests / 11 assertions** pour les limiteurs seuls. PHPStan, PHP-CS-Fixer en dry-run et Rector en dry-run passent sur la suite fonctionnelle et `UserTest`. Une mutation temporaire qui ignore la durée demandée au limiteur fait échouer le scénario d'expiration ; le fichier de production est restauré à l'identique.

Les suites utilisant les mêmes flags Redis doivent être exécutées séquentiellement : un lancement simultané a provoqué des refus incohérents, puis le rejeu séparé a validé les deux suites. Le README documente cette contrainte. Les résultats ci-dessus viennent du rejeu séparé, pas de cette exécution concurrente. Ces dernières corrections restent non commitées ; les contrôles PHP globaux avant commit restent à exécuter si un commit est demandé.

## Résultats initiaux de la partie 3 — 1er octobre 2026

La branche `20284-participant-reconciliation-tests` part de `20284-users-local-auth-tests` (commit `b57248f1c8`) et ajoute un filet de caractérisation sans import/double FOS, SQL sur la table historique ou snapshots :

- `ParticipantTest` : état anonyme, consentements, confirmation, jetons indépendants, association à un User et collections de contenu associé ;
- `ParticipantHelperTest` : résolution des tokens bruts/encodés, refus sans écriture et création de nouvelles identités avec le générateur de tokens ;
- `ContributionsReconcilierTest` : matrice des exigences e-mail/téléphone/SSO pour les cibles User et Participant, conflits d'identité, transfert idempotent et rotation du token de fusion ;
- `VotesReconcilierTest` : collecte/sélection × User/Participant, doublons, bulletins vides, minimum/maximum, budget, classement, étapes fermées et rejeu ;
- `SendParticipantPhoneValidationCodeMutationTest` : normalisation du numéro, limite de deux SMS par minute, refus fournisseur, persistance de la demande et bypass de l'environnement test ;
- trois suites sous `tests/Participant/Functional` : sorties GraphQL et persistance réelles de la suppression et du téléphone, authentification du User correspondant, fusion de Participant et rotation de son token, transferts de propositions/réponses/votes, conservation du contenu associé, idempotence et rollback fourni par l'appelant.

La suppression n'expose pas de champ `errorCode` : son contrat actuel utilise une erreur GraphQL pour un Participant introuvable et un refus d'accès pour un utilisateur connecté sans droit. Un appel anonyme provoque actuellement une erreur interne de type, caractérisée séparément. Les tests vérifient ces sorties et l'absence de suppression, plutôt que d'inventer un code d'erreur. Les refus SMS vérifient explicitement `PHONE_ALREADY_CONFIRMED`, `RETRY_LIMIT_REACHED`, `INVALID_NUMBER`, `CODE_EXPIRED`, `CODE_NOT_VALID` et `SERVER_ERROR` aux couches correspondantes.

Le fournisseur SMS est remplacé à sa frontière, sans credentials ni appel réseau. Seule la définition du fetcher en configuration **test** devient publique. Les tests de succès/refus fournisseur de vérification construisent la vraie mutation avec un kernel déclarant `prod`, puis restaurent immédiatement le kernel HTTP de test : ils traversent donc la branche fournisseur que l'environnement `test` ignore habituellement. Le succès fournisseur vérifie l'approbation persistée du SMS ; les autres succès GraphQL conservent le bypass de test. Aucun scénario ne prétend contacter le fournisseur réel.

### Réduction Cypress et décisions sur les cas ignorés

Les trois fichiers existants du job CircleCI `e2e-cypress-frontoffice-workflow` conservent chacun trois scénarios :

| Suite | Parcours conservés |
|---|---|
| Collecte | Participant avec exigences et consentements ; connexion locale dans le workflow ; fusion de votes avec un User existant |
| Sélection | Participant avec exigences et consentements ; connexion locale dans le workflow ; fusion de votes avec un User existant |
| Questionnaire | Ajout/modification/suppression d'une réponse anonyme ; connexion locale dans le workflow ; deux réponses du même Participant |

Chaque scénario est dans sa propre suite avec `db:restore` en `before`, puis désactivation du feature flag et restauration de la base en `after`. Les scénarios anonymes utilisent des e-mails/numéros distincts et valident le CAPTCHA final. Les assertions de questionnaire attendent la réponse de `ValidateContributionMutation` plutôt qu'un écran transitoire. Ces specs ne contiennent plus de SQL direct, `.only` ou `.skip`. Les tâches du runner Cypress passent par Castor.

| Ancien bloc ignoré | Décision explicite |
|---|---|
| Budget collecte et sélection | Remplacé par la matrice PHPUnit : budget dépassé, borne exacte et déduplication ; validation de la persistance dans la suite fonctionnelle de votes |
| Classement collecte et cas « conserver le bulletin User ayant atteint le minimum » | Remplacés par la matrice PHPUnit pour collecte **et** sélection : priorité du bulletin établi, adoption du premier bulletin complet et positions des doublons |
| Counters collecte/sélection et cas sélection sans minimum/maximum avec exigences | Les variantes de configuration sont supprimées de Cypress ; les parcours retenus vérifient les compteurs visibles après validation et fusion. La matrice algorithmique est exercée en PHPUnit. Cela ne prétend pas conserver toutes les anciennes combinaisons d'interface |
| Consentement interne collecte sans exigences | Variante de configuration supprimée de cette suite ; le consentement est exercé dans le parcours Participant avec exigences. Le rendu spécifique sans exigences n'est pas couvert par les neuf scénarios retenus |

Les variantes actives fondées sur du SQL (classement, compteurs, exigences supprimées) sont également retirées. Les variantes magic link du workflow sont supprimées comme duplication du mode de connexion ; la partie 2 conserve le contrat backend du magic link. Les réponses multiples/conflits sont protégés par les suites de reconciliation et le parcours questionnaire représentatif. Cette réduction protège un filet représentatif et ne constitue pas une revendication d'équivalence exhaustive de couverture UI.

### Comportements observés et limites

- Une fusion de Participant par téléphone supprime actuellement une réponse sur une étape fermée : le reconciler refuse le transfert, puis la suppression du Participant source déclenche le `ON DELETE CASCADE`. Cette perte de contenu associé est caractérisée et nécessite une correction/décision séparée.
- La suppression appelée anonymement produit une erreur GraphQL interne (viewer nul passé à un argument User non nullable), sans supprimer le Participant. Le refus métier explicite reste à décider/corriger séparément.
- Une fusion sans minimum peut dépasser le maximum si aucun des deux bulletins n'atteint individuellement la limite (`maximum=3`, deux votes de chaque côté → quatre votes).
- Plusieurs nouveaux votes classés peuvent recevoir la même position dans la branche de fusion par défaut.
- La règle de réconciliation privilégie SSO, puis e-mail, puis téléphone ; elle ne combine pas toutes les exigences. La comparaison d'e-mail est stricte et sensible à la casse.
- Le rollback vérifié protège les données SQL lorsque **l'appelant** fournit une transaction/savepoint. Les reconcilers effectuent plusieurs flushes et ne fournissent pas eux-mêmes l'atomicité ni le rollback des effets d'indexation externes.
- En environnement `test`, l'envoi de SMS ne persiste pas lui-même le numéro et la vérification ignore le code fournisseur ; le parcours fonctionnel met à jour le Participant via `updateParticipant` avant envoi/vérification, comme le workflow.

Les cas `CharacterizationGap` rendent ces lacunes visibles sans correction de production. Leur résolution et l'atomicité des orchestrateurs restent des décisions séparées.

### Validation

Le rejeu PHPUnit du périmètre Participant/réconciliation, incluant les tests existants de propositions/réponses, passe : **159 tests, 1 646 assertions**. Les trois suites fonctionnelles passent également en ordre aléatoire (`--random-order-seed=20261001`) : **29 tests, 577 assertions**.

Les dernières exécutions Cypress sont vertes : collecte 3/3, sélection 3/3, puis questionnaire 3/3 après ajout du CAPTCHA final manquant. Aucun scénario n'est ignoré. ESLint, PHPStan global, PHP-CS-Fixer global en dry-run, Rector global en dry-run, `git diff --check` et `.circleci/check-cypress-spec-coverage.sh` passent.

Limite de cette validation Cypress : les assets de développement initiaux échouaient sur `graphql: Unexpected invocation` dans `admin-next/shared/navbar/NavBarQuery.tsx`. Le build local a été refait sans cache Webpack/Babel, avec `compilerOptions.target: 'es6'` pour `ts-loader`, afin de préserver le tagged template avant la transformation Relay. Ce réglage est temporaire et aucun fichier de configuration du build n'est modifié sur cette branche. Les résultats verts ne prouvent donc pas le fonctionnement du build d'assets par défaut ; ce problème reste séparé.

Les trois nouvelles suites fonctionnelles sont découvertes par `tests/**/*Test.php`, et les specs Cypress restent dans le dossier déjà exécuté en CI. Cette vérification de configuration ne prouve pas une exécution CI distante.

## Mise en conformité de la partie 3 — 5 octobre 2026

Revue du commit `712d708fbd`, seul commit propre à la branche actuelle `20284-participant-reconciliation-tests`, dont le parent est `0a93ca9887`.

**Bilan de périmètre : la partie 3 dispose du filet demandé**, mais son implémentation initiale ne respectait pas entièrement les ADR du 2 octobre. La fin de cette partie ne vaut ni correction des anomalies caractérisées, ni achèvement des parties 4 et 5, ni clôture de la remise en état de l’ensemble des tests User/Participant.

Les corrections apportées sont les suivantes :

- La matrice des exigences ne contourne plus la visibilité protégée avec un `Probe` : les vrais reconcilers de propositions et réponses sont exercés par leur méthode publique. Les assertions vérifient le propriétaire résultant, y compris pour une cible Participant, une identité en conflit ou une étape fermée.
- Les tests unitaires de votes et du helper Participant ne prescrivent plus le nombre ou l'ordre des appels à Doctrine. Les objets métier sont réels, les repositories fournissent les données du scénario, et les assertions scalaires/tableaux sont strictes. Les tests unitaires ne revendiquent pas de preuve de persistance.
- Les tests fonctionnels de contributions et votes déclenchent la réconciliation depuis HTTP : connexion avec cookies de participation ou mutation de vérification du téléphone. Ils relisent les données SQL après vidage de l'EntityManager ; les votes sont vérifiés par leurs propositions distinctes et leurs propriétaires, pas seulement par un compteur.
- La matrice d'envoi SMS traverse également HTTP et vérifie les demandes réellement persistées, leur statut, le numéro normalisé et l'absence d'effet sur une identité voisine. Les refus de vérification laissent le téléphone non confirmé et le SMS en attente ; les refus de suppression préservent aussi un Participant voisin.
- Le scénario d'erreur d'indexation vérifie une erreur GraphQL et l'absence de payload de succès, puis le bulletin restauré par le savepoint de l'appelant. Il ne prétend pas que le workflow fournit lui-même une transaction.
- Les fixtures choisies sont explicites, les étapes ouvertes/fermées ont des dates connues, et les neuf parcours Cypress ont des données déterministes sur un socle restauré. Les réponses des mutations de validation/suppression sont attendues et contrôlées ; le nom trompeur du scénario de fusion « max = 4 » est corrigé, car la fixture utilisée a un maximum de cinq.

Les contrats GraphQL restent dans les suites HTTP PHPUnit existantes pour exercer des risques distincts avec une transaction SQL et des frontières SMS/indexation contrôlées. Le guide Jest recommande sa suite API pour les nouveaux contrats GraphQL, mais n'impose pas de déplacer ces tests ni de dupliquer les mêmes scénarios. Aucun fichier Jest ne fait partie du commit audité.

Deux injections temporaires de régression ont confirmé la discrimination : neutraliser le transfert de propriétaire fait échouer la matrice publique ; supprimer la persistance de la demande SMS fait échouer le scénario HTTP d'envoi réussi. Ces modifications de production ont été intégralement restaurées.

Les deux variantes fonctionnelles auparavant exécutées directement sur les services (conflit et étape fermée vers Participant) sont couvertes dans la matrice publique de propositions **et** de réponses. La suite HTTP vérifie la conservation lors de la connexion vers User et le transfert réussi vers Participant ; la perte de réponse du workflow téléphone sur étape fermée reste caractérisée séparément. On ne présente pas l'ancien appel direct comme une preuve du comportement complet de l'orchestrateur.

Validation PHPUnit actualisée : **174 tests, 1 956 assertions**, en ordre aléatoire (`--random-order-seed=20261005`). Le périmètre comprend les huit classes du commit, les tests historiques de propositions/réponses et `LocalAuthenticationTest`, afin de vérifier aussi le point d'extension du harness d'indexation. La découverte PHPUnit liste ces 174 cas et le glob CircleCI conserve les huit classes concrètes.

PHPStan global, PHP-CS-Fixer global en dry-run, Rector global en dry-run, ESLint des trois specs et du plugin Cypress, `git diff --check` et `.circleci/check-cypress-spec-coverage.sh` passent. Les injections temporaires de régression sont restaurées ; aucun fichier de production ou de configuration n'est modifié.

Validation Cypress actualisée : **9/9 scénarios passent**, sans test ignoré ni retry, en 4 min 17 s. Le rejeu utilise les assets installés, sans reconstruction ni changement de configuration pendant cette revue. Cela ne prouve pas que le build d'assets par défaut fonctionne, puisque les assets peuvent provenir de la reconstruction temporaire documentée le 1er octobre. La CI distante reste non vérifiée.

## Mise en conformité du commit `0a93ca9887` — 6 octobre 2026

Le périmètre reste limité aux tests touchés par ce commit et à leur documentation :

- suppression des annotations `@coversNothing` et ajout des statuts `compliant` motivés ;
- canonicalisation persistée vérifiée depuis l’inscription, la confirmation HTTP et la connexion ; conservation des espaces vérifiée séparément via l’API publique du canonicalizer, sans kernel ;
- rôles par défaut et dupliqués vérifiés par leurs conséquences sur l’accès HTTP à l’administration, plutôt que par les méthodes héritées de FOS ;
- refus vérifiés par leur code public et les effets interdits, confirmation invalide contrôlée après relecture du jeton et de la date en base ;
- publication du message de changement de mot de passe vérifiée, doubles sans attente d’interaction remplacés par des stubs ;
- date de suppression fixe et timestamp de reset borné par le début et la fin de la requête.

Validation ciblée : **63 tests / 1 216 assertions** en ordre aléatoire (seed `20284`), **6 tests / 16 assertions** dans `UserTest`. PHPStan, PHP-CS-Fixer et Rector passent sur ces fichiers. Une mutation du canonicalizer chargée uniquement en mémoire, ajoutant un `trim()`, fait échouer les deux cas de conservation des espaces ; aucun fichier de production n’est modifié. Les scénarios `CharacterizationGap` sont conservés sans modifier les règles produit. Les contrôles PHP globaux avant commit restent à exécuter si un commit est demandé.

## Début de la partie 4 — 5 octobre 2026

Le premier lot est réalisé sur `20284-sso-tests`, créée depuis
`20284-participant-reconciliation-tests`. Il ne clôt pas la partie 4.

- `OauthUserProviderTest` utilise désormais le gestionnaire interne `Capco\UserBundle\Doctrine\UserManager`, sans import ni mock direct de l'interface FOS. Ce gestionnaire hérite encore de FOS en production : le retrait du vendor reste un chantier séparé. Les deux utilisateurs auparavant simulés sont remplacés par des entités réelles, et une session en mémoire remplace les attentes sur l'ordre des écritures. Les assertions vérifient les identifiants, les jetons, la conservation du profil OpenID et, lors d'une collision FranceConnect, la conservation des deux comptes ainsi que les données de déconnexion et le message utilisateur. Les attentes historiques sur certaines interactions de recherche/mise à jour subsistent ; la classe conserve donc son marqueur `non-compliant` et ne prouve pas la persistance ni un callback HTTP OAuth complet.
- `SamlUserProviderTest` ajoute cinq scénarios HTTP sur `/login-saml` : création, rattachement à un compte de même e-mail, réutilisation après changement d'e-mail local, priorité d'un identifiant SAML déjà lié sur l'e-mail d'un autre compte, et refus d'une réponse fournisseur vide. Les scénarios heureux vérifient la redirection, le viewer authentifié lors des requêtes suivantes, les données et le groupe SAML relus après vidage de l'EntityManager, l'absence de doublon à la reconnexion et la préservation d'un compte voisin.
- `CasUserProviderTest` ajoute deux refus HTTP : feature flag désactivé et configuration CAS désactivée. Une session contenant un identifiant CAS connu reste anonyme ; le compte, son mot de passe et ses groupes sont préservés.

Ces nouveaux scénarios suivent la frontière HTTP et les règles d'isolation de
l'ADR PHPUnit. Le client SimpleSAML est la seule frontière fournisseur remplacée
dans les scénarios SAML ; son service est rendu public uniquement en environnement
`test`. Un kernel de test doté d'un cache distinct permet de conserver les services
SAML, normalement supprimés à la compilation lorsque l'autorisation SAML est
désactivée. Les variables d'environnement sont fixées puis restaurées, les feature
flags et sessions sont nettoyés, les écritures SQL sont annulées et les entrées Redis
de recalcul des comptes créés par SAML sont retirées. Ces tests ne valident ni la
signature d'une assertion SAML ni les échanges réseau avec un fournisseur réel,
ni l'indexation Elasticsearch. Aucun nouveau contrat Jest n'est ajouté ou dupliqué.

Validation locale : **46 tests, 547 assertions**, en ordre aléatoire
(`--random-order-seed=20261005`) sur OAuth, SAML, CAS, logout CAS et authentification
locale. PHPStan global, PHP-CS-Fixer global en dry-run, Rector global en dry-run
et `git diff --check` passent. La suppression temporaire du rattachement SAML
par e-mail fait échouer l'assertion sur le compte relu en base ; le test repasse
après restauration intégrale de la production. La suite SAML est découverte par
PHPUnit et correspond au glob CircleCI `tests/**/*Test.php` ; la CI distante
n'a pas été exécutée.

À l'issue de ce premier lot restaient notamment les callbacks HTTP
OAuth/OpenID/FranceConnect complets, les refus fournisseur et erreurs réseau,
les autres mappings d'attributs SAML, les attributs manquants, le logout SAML
et les contrats CAS encore absents.

## Lot SAML de la partie 4 — 5 octobre 2026

Ce lot complète les cinq scénarios SAML du premier lot avec seize nouveaux cas :

- Les sept fournisseurs configurés (`dev`, `grandest`, `univ-lyon1`, `cd59`,
  `april`, `clermont`, `sorbonne`) utilisent leur attribut d'identité attendu.
  Chaque connexion traverse `/login-saml`, vérifie la redirection et le viewer,
  puis relit le rattachement SAML, le profil local, le mot de passe et le groupe
  après vidage de l'EntityManager.
- Pour chaque fournisseur, une réponse contenant des attributs mais dépourvue
  de l'attribut d'identité attendu renvoie actuellement **HTTP 500**. Le viewer
  reste anonyme, sans rattachement ni groupe SAML, et le mot de passe est conservé.
  Les cas `CharacterizationGap` documentent cette lacune ; ils ne font pas du
  statut 500 une exigence produit à préserver indéfiniment.
- La déconnexion HTTP efface l'authentification et les données privées de session,
  y compris après rejeu du cookie précédent, et conserve le compte en base.
  L'appel de déconnexion au fournisseur et sa destination sont vérifiés à la
  frontière SimpleSAML uniquement lorsque le feature flag SAML est activé.

`SamlWebTestCase` centralise le kernel SAML, l'injection du client externe,
le choix du fournisseur et la restauration de l'environnement. L'authenticator
réel est rendu public uniquement dans la configuration `test`, pour choisir le
fournisseur sans modifier le cache commun. La suite de logout utilise une session
SimpleSAML transitoire et des processus séparés ; les autres règles d'isolation
SQL, Redis, sessions et feature flags du premier lot restent applicables.
Ces tests ne valident ni les signatures SAML ni un échange réseau avec un IdP réel.

La modification temporaire du mapping Sorbonne de `mail` vers `email` fait échouer
le scénario HTTP correspondant (500 au lieu de 302). Le fichier de production
est intégralement restauré avant le rejeu du périmètre.

Les deux suites concrètes sont découvertes par PHPUnit : **21 cas SAML**,
compatibles avec le glob CircleCI `tests/**/*Test.php`. La CI distante reste
non exécutée. Aucun contrat Jest n'est ajouté ou dupliqué.

Validation locale finale : **62 tests, 853 assertions**, en ordre aléatoire
(`--random-order-seed=20261005`) sur OAuth, SAML, logout SAML, CAS, logout CAS
et authentification locale. PHPStan global, PHP-CS-Fixer global en dry-run,
Rector global en dry-run et `git diff --check` passent. Aucun fichier de
production n'est modifié.

Les callbacks HTTP OAuth/OpenID/FranceConnect, les refus et erreurs réseau
de ces fournisseurs et les contrats CAS manquants restent à traiter. Les
brouillons OAuth/CAS non validés sont conservés hors du checkout, sans ajout
à la suite ni à sa configuration. Le travail s'arrête après ce lot SAML à la
demande de l'utilisateur ; la partie 4 n'est pas entièrement terminée.

## Lots CAS et callbacks OAuth de la partie 4 — 6 octobre 2026

La reprise conserve le lot SAML et ajoute deux suites HTTP, après correction
et validation des brouillons conservés hors du checkout :

- `CasAuthenticationTest` couvre sept cas : retour de la passerelle CAS vers la
  destination locale demandée, identité vide, entrée désactivée par flag ou
  configuration, et autorisation CAPEB accordée pour deux types utilisateur ou
  refusée. Les comptes, types et groupes sont relus en SQL après `clear()` ;
  le compte voisin reste inchangé. Les refus empêchent la connexion ; l'entrée
  désactivée ne contacte pas la passerelle. Le refus CAPEB actuel renvoie 403,
  tandis qu'une identité CAS vide renvoie 401 avec un message générique.
- `OAuthCallbackTest` couvre 35 cas OpenID, Facebook et FranceConnect v1/v2 :
  création, rattachement par e-mail, priorité de l'identité fournisseur déjà liée
  lorsque son nouvel e-mail appartient à un autre compte, conservation du profil
  et du mot de passe, et absence de doublon dans les groupes SSO existants.
  Chaque scénario commence par la redirection d'autorisation puis traverse le
  callback HTTP ; le viewer et les données persistées sont contrôlés.
- Les refus OAuth vérifient la redirection d'échec, l'erreur en session,
  l'absence d'authentification et la conservation du compte sans rattachement :
  refus fournisseur standard sans code, `invalid_grant`, absence de code et
  erreurs réseau des endpoints token/userinfo. FranceConnect ajoute state
  étranger, nonce étranger et absence du cache de state attendu.
- FranceConnect v2 utilise de vrais JWT RS256 et vérifie la signature de la
  réponse userinfo, ainsi que les refus d'une signature altérée, d'une réponse
  malformée et d'un jeton expiré. Les clés publiques sont préparées dans le
  cache isolé par l'API publique `CachedKeySet`, avec une réponse JWKS figée.
  La récupération et la rotation des clés auprès du fournisseur réel ne sont
  pas exercées.

Les vrais resource owners, gestionnaire de comptes, Doctrine et firewall sont
utilisés. Les doubles remplacent les passerelles CAS/CAPEB et le transport HTTP
OAuth. La configuration `test` rend ces frontières remplaçables et permet un
namespace Redis unique par scénario ; seul ce namespace est vidé. SQL, sessions,
flags et variables d'environnement sont restaurés, et les comptes créés par les
callbacks sont retirés de la file Redis de recalcul des compteurs. L'indexation
Elasticsearch reste neutralisée par le socle HTTP.

Chaque reconnexion OAuth prépare un compte et ses groupes déjà persistés, puis
exécute un nouveau parcours HTTP dans un scénario indépendant. Elle ne conserve
pas un resource owner FranceConnect à travers plusieurs cycles login/logout :
ce service capture l'état de session lors de sa construction, alors que les
requêtes de production reconstruisent les services. L'idempotence des groupes
est vérifiée par leurs titres et la conservation du compte, après relecture SQL.

Un refus standard OpenID/Facebook est actuellement enregistré comme absence de
code OAuth ; FranceConnect conserve son message de refus dédié. Ce constat ne
prescrit pas de conserver cette différence de messages lors d'une évolution.
Ces suites ne revendiquent pas de validation des signatures SAML, ni des règles
issuer/audience, ni de validation cryptographique complète des ID tokens
OpenID/FranceConnect. Les échanges réels avec les fournisseurs restent exclus.

Deux régressions temporaires sont discriminées : supprimer la validation de
signature FranceConnect v2 transforme le refus attendu en callback réussi ;
supprimer l'affectation du type CAPEB fait échouer sa relecture. Les fichiers de
production sont intégralement restaurés avant le rejeu du périmètre.

Le filet minimal demandé par la partie 4 est désormais réalisé : découplage du
mock FOS OAuth, contrats CAS/SAML et callbacks OAuth avec collisions et refus.
Cela ne clôt pas la partie 5 et ne corrige pas les lacunes produit caractérisées.
La suppression de FOSUserBundle appartient au chantier séparé `18981-remove-fos-user`. Avant la revue
de conformité ci-dessous, la classe OAuth unitaire historique conservait son
statut `non-compliant` ; les nouvelles suites HTTP complétaient ses preuves
de persistance.

Validation locale : **130 tests, 2 176 assertions**, en ordre aléatoire
(`--random-order-seed=20261006`) sur les suites OAuth/CAS/SAML, leurs logouts,
les resource owners OpenID/FranceConnect, les options FranceConnect, le
contrôleur SSO, les subscribers de callback/logout et l'authentification locale.
Les 42 nouveaux cas passent aussi ensemble en ordre aléatoire. PHPStan global,
PHP-CS-Fixer global en dry-run, Rector global en dry-run et `git diff --check`
passent. Aucun fichier de production n'est modifié dans le résultat final.

La découverte PHPUnit retrouve les 35 cas OAuth et les sept cas CAS ; leurs
fichiers correspondent au glob CircleCI `tests/**/*Test.php`. Aucun contrat Jest
n'est ajouté ou dupliqué. La CI distante reste non exécutée.

## Revue de conformité de la partie 4 — 6 octobre 2026

La reprise reste dans le même commit de la branche. `OauthUserProviderTest`
utilise maintenant les vrais services, repositories et gestionnaire de comptes.
Ses assertions sur le nombre d'appels et les arguments des recherches/mises à
jour sont supprimées. Les contrats communs déjà couverts par `OAuthCallbackTest`
sont regroupés ; les variantes propres aux instances et les règles de mapping
restent vérifiées explicitement.

La classe comprend **18 scénarios HTTP** : sélection de l'e-mail principal,
`mail` et `other email`, priorité du jeton OpenID selon l'instance, rafraîchissement
ou conservation du profil, création Facebook sans adresse e-mail, déplacement
d'une identité fournisseur après confirmation du formulaire réel, mapping
FranceConnect autorisé et refus de rattachement. Les comptes sont relus après
`clear()`, les mots de passe locaux sont préservés et les viewers contrôlés.
La collision FranceConnect vérifie aussi la redirection de déconnexion du
fournisseur et son `id_token_hint`, sans lire les clés internes de la session.

Deux méthodes conservent un statut `non-compliant` explicite, au niveau le plus
précis, afin de préserver **quatre scénarios historiques utiles** :

- les trois variantes de la méthode publique de mapping FranceConnect utilisent
  encore un kernel pour obtenir ce service, mais ne revendiquent aucune preuve
  de persistance ; leurs résultats attendus sont littéraux ;
- la réponse FranceConnect sans access token ni sujet est testée directement sur
  le provider réel, car elle ne traverse pas le transport OAuth normal. Sa
  persistance est relue et son contexte de requête/authentification est restauré.

Aucun graphe de services métier n'est simulé dans ces exceptions. Elles évitent
une modification de production uniquement destinée aux tests. Le statut de
classe `compliant` s'applique aux scénarios HTTP, avec les exceptions de méthode
ci-dessus. `@coversNothing` est retiré ; aucune annotation de couverture ne reste
dans les fichiers PHP modifiés par ce commit.

`OAuthWebTestCase` centralise les réponses externes, la configuration avant le
boot du kernel, l'horloge JWT fixe et sa restauration, ainsi que l'isolation Redis.
Chaque scénario possède un sujet fournisseur unique. Le nettoyage des comptes
créés fonctionne aussi sans adresse e-mail ou sans identifiant fournisseur.
`CasUserProviderTest` retire désormais de Redis le recalcul du compte créé par
le callback avant le rollback SQL. Les cinq `public: true` redondants des services
ajoutés sont retirés ; `_defaults.public: true` conserve leur caractère remplaçable.

Le callback HTTP OpenID refuse actuellement une réponse contenant seulement un
ID token sans access token : ce refus est ajouté aux **36 cas** de
`OAuthCallbackTest`, avec absence de rattachement et de session authentifiée.
Il distingue la priorité d'un ID token en présence d'un access token du refus du
transport lorsque ce dernier manque.

Validation après reprise : **112 tests / 2 308 assertions**, puis **27 tests /
489 assertions** sur les contrats locaux et de logout voisins, le nettoyage CAS
et le rattachement OpenID après restauration de production. Ces deux lots
passent en ordre aléatoire avec la seed `20261006` et couvrent **132 scénarios
uniques** ; sept scénarios sont rejoués dans le second lot. Une suppression
temporaire de la dissociation de l'identité OpenID précédente fait échouer le
rattachement (collision SQL, HTTP 500 au lieu de 302) ; le fichier de production
est restauré octet pour octet et les trois variantes repassent.

PHPStan global, PHP-CS-Fixer global en dry-run, Rector global en dry-run et
`git diff --check` passent. Les deux classes OAuth concrètes restent découvertes
par PHPUnit et le glob CircleCI `tests/**/*Test.php` ; le socle partagé est abstrait.
Aucun contrat Jest n'est ajouté ou dupliqué. La CI distante reste non exécutée.

## Résultats de la partie 5 après correction du périmètre — 6 octobre 2026, mise à jour le 7 octobre

La première implémentation retirait les accès SQL sur `fos_user`, ajoutait `_userFixtures.js` / `_userFixtures.php` et avait passé cinq tests PHPUnit (52 assertions), vingt tests Jest et huit snapshots. Cette approche a été revue après clarification : le schéma SQL reste inchangé et aucun retrait du bundle n’est effectué dans cet audit. Ces anciens résultats ne sont pas présentés comme validation du code corrigé.

### 5.1 — PHPUnit : recalcul des compteurs et contrat SQL conservé

`RecalculateUsersCountersCommandTest` utilise toujours le socle transactionnel `DatabaseCommandTestCase`, des comptes et votes propres aux scénarios, ainsi qu'un client Redis réel avec un préfixe unique par scénario. La vraie commande est enregistrée dans une application Console avec le véritable EntityManager. La file partagée n'est pas vidée ; le teardown supprime uniquement la clé de la file du scénario et annule les écritures SQL, même après un échec. L'indexation Elasticsearch reste neutralisée par le socle.

Les lectures de compteurs passent désormais directement par `SELECT` sur `fos_user` et ses colonnes `proposal_votes_count`, `opinion_version_votes_count`, `argument_votes_count`, `source_votes_count`. Le scénario de consommation de la file réintroduit également une valeur obsolète par `UPDATE` sur cette table avant le deuxième passage. Ces accès vérifient explicitement le contrat du stockage conservé, sans utiliser le mapping Doctrine pour en déterminer les noms physiques.

Les cinq scénarios restent : file vide, compte sans vote avec remise à zéro des quatre compteurs, compte placé dans la file avec voisin préservé et deuxième passage sans recalcul, mode `--force` incluant un compte hors file, exclusion des votes privés et propositions en brouillon. Les données de contexte réutilisées sont limitées à l'étape `collectstep1` et son formulaire. Aucun skip ni annotation `@coversNothing` ne reste dans cette classe.

Validation de la reprise : **5 tests / 51 assertions**, en ordre aléatoire avec les seeds `20261006` et `20261007`. La différence avec les 52 assertions de l'ancienne version vient du retrait de la lecture ORM de préparation au deuxième passage. La suite protège les valeurs positives de votes de propositions et la remise à zéro des trois autres compteurs sur les comptes sans ces contributions ; elle ne revendique pas une matrice exhaustive des votes de versions d'opinion, arguments ou sources.

### 5.2 — Jest GraphQL : préparations SQL et assertions de résultat

Les quatre suites `Other/register.js`, `askProposalRevision.js`, `Mediator/addMediatorVotes.js` et `Mediator/updateMediatorVotes.js` retrouvent leurs préparations et lectures SQL explicites. Les helpers `_userFixtures.js` et `_userFixtures.php` sont supprimés.

- L'inscription vérifie le pseudo nettoyé renvoyé par la mutation, puis relit directement le pseudo et l'e-mail stockés dans `fos_user`. Une valeur concaténée avec des délimiteurs permet de vérifier le pseudo et l’e-mail exacts dans la sortie du runner SQL avec `toContain`, sans imposer l’égalité de toute cette sortie.
- Les refus de révision préparent directement l'absence d'auteur dans `proposal` ou d'e-mail dans `fos_user`. Ils vérifient le code `PROPOSAL_AUTHOR_HAS_NO_EMAIL` et l'absence de payload de succès, en conservant les snapshots utiles.
- Les deux refus médiateur ajoutent par SQL une exigence `PHONE_VERIFIED` sur l'étape de sélection et affectent le numéro confirmé au compte voisin. Le code `PHONE_ALREADY_USED_BY_ANOTHER_USER` et l'absence de médiateur dans le payload sont vérifiés explicitement, avec maintien des snapshots.

Les quatre suites importent `_setupDB` et `_setupES`, qui restaurent MySQL et Elasticsearch avant chaque test. Le 7 octobre, leurs restaurations en `afterAll` ont été retirées : elles sont redondantes pour l’isolation entre les tests, et aucun besoin de remise à zéro en fin d’exécution n’est identifié. Les helpers ne sont plus exportés. L’import de `_setupES` dans `register.js` est conservé pour la restauration avant chaque test. La lecture de `stderr` des commandes est corrigée. Les invocations Fabric restent sous leur forme historique `fab`, sans préfixe ajouté ni modification du setup global.

**Limites conservées :** ce lot ne certifie pas la conformité globale des suites Jest. Les notifications et messages d'indexation produits par l'API ne sont pas isolés, et l'inscription remet les flags aux valeurs par défaut de test plutôt qu'à leur état initial. Les marqueurs `non-compliant` correspondants restent présents. La vérification exhaustive des effets persistés des mutations médiateur/révisions et la refonte de cette infrastructure restent des lots distincts.

Validation historique de la reprise du 6 octobre, avant le retrait des `afterAll` : **4 suites Jest / 20 tests / 8 snapshots passent**, sans modification des snapshots, avec les invocations Fabric historiques et l'installation locale réparée. PHPStan, PHP-CS-Fixer et Rector globaux passent ; ESLint ne rapporte aucune erreur et le formatage est vérifié. Les avertissements historiques de logs et d'alias Jest restent distincts.

Après le retrait des `afterAll` le 7 octobre, la syntaxe des six fichiers JavaScript concernés et `git diff --check` ont été vérifiés. Les suites d’intégration et les contrôles PHP n’ont pas été relancés pour cette modification ; les résultats précédents ne constituent pas un nouveau rejeu.

Lors de la validation du 6 octobre, deux régressions temporaires ont été détectées : retirer le filtre des comptes de la file fait échouer l'assertion SQL sur le voisin ; retirer le contrôle de réutilisation du téléphone fait échouer le refus médiateur explicite. Les deux fichiers de production sont restaurés octet pour octet avant les rejeux réussis : les cinq scénarios PHPUnit repassent, ainsi que les trois scénarios Jest ciblant le pseudo stocké et les deux refus de téléphone (deux snapshots). Les scénarios non sélectionnés par ce filtre restent actifs dans leur suite complète. Aucun test focalisé ou ignoré n'est ajouté au code. La découverte PHPUnit et Jest conserve les emplacements existants ; la CI distante doit être vérifiée sur le commit corrigé. Aucun fichier de production, schéma SQL, fixture partagée ou instruction personnelle n'est modifié dans le résultat de cette branche.

## Résultats de la partie 6 — 7 octobre 2026

Le lot est réalisé sur `20284-user-tests-ci-hygiene`, créée depuis `20284-user-counter-tests-decoupling` à la demande de l’utilisateur. Il modifie uniquement l’infrastructure de test, les specs concernées et leur documentation.

### Répartition CircleCI et tests focalisés

Le `it.only` de la recherche Cypress est retiré : les trois scénarios de cette spec sont désormais exécutés. Les scripts CJS de contrôle et le job CI associé sont retirés à la demande de l’utilisateur ; aucune garde automatisée dédiée ne les remplace dans ce lot.

Le job `unit-js` répartit ensemble `frontend/**/*-test.ts` et `frontend/**/*-test.tsx`, puis passe les chemins assignés à `--runTestsByPath`. Un exécuteur sans fichier frontend n’exécute pas toute la suite par défaut. Les changements de `.circleci/` déclenchent aussi les étapes Jest frontend et admin-next ; le sharding admin-next est conservé.

### Isolation Cypress et cas ignorés

`shield.cy.ts` restaure MySQL, Elasticsearch et la file RabbitMQ via `db:restore` avant d’activer ses flags. Son second hook de désactivation de `shield_mode`, redondant avec le premier, est supprimé.

Le premier rejeu révèle un décalage d’environnement : les tâches locales activaient les flags dans le namespace Symfony `dev`, alors que Nginx sert `capco.test` avec le kernel `test`. Les trois scénarios shield attendaient donc une requête `ShieldPageQuery` absente. Un changement temporaire des tâches vers `test` a permis de valider les parcours.

La [PR #20296 — test: fix feature toggles not working locally](https://github.com/cap-collectif/platform/pull/20296), mergée le 6 octobre, traite déjà ce défaut et le namespace Redis des flags côté SSR Next.js. Elle fixe `toggleEnvironment` à `test` et fait utiliser à `feature-flags-resolver.ts` le namespace `testfeature_toggle` lorsque `getEnv()` vaut `test`. `NEXT_PUBLIC_SYMFONY_ENV=test` dans `admin-next/.env.local` pilote ce dernier choix ; il ne configure pas directement les tâches Fabric du plugin. Les deux réglages alignent les écritures Cypress et les lectures PHP/Next.js.

Cette PR est absente de la base locale de la branche au moment de la revue. La modification temporaire de `cypress/plugins/index.ts` est retirée de ce lot pour ne pas dupliquer sa correction, et aucun changement du résolveur de production n’est ajouté. La base doit intégrer #20296 avant de refaire les validations Cypress sur le code final de la branche.

`rgpd.cy.ts` reste une suite de cookies du navigateur, adjacente et exclue de l’inventaire principal User. Aucun scénario `.skip` ne subsiste dans les trois workflows User/Participant. La recherche des tests focalisés ne relève plus de `.only` dans les suites Jest/Cypress inspectées.

Dix scénarios Cypress historiques restent ignorés dans des suites adjacentes :

| Fichier | Scénarios ignorés | Décision dans ce lot |
|---|---:|---|
| `frontOffice/event/eventPage.cy.ts` | 1 | Export des invités par l’auteur d’un événement : précondition d’identité et contrat d’export adjacent ; à reprendre dans son périmètre. |
| `frontOffice/proposal/proposalVotes.cy.ts` | 1 | Réordonnancement des votes : le commentaire existant indique que le glisser-déposer ne modifie pas le HTML. Ce scénario UI n’est pas remplacé par les preuves algorithmiques de la partie 3 ; sa réparation reste distincte. |
| `frontOffice/opinion/opinionVersion.cy.ts` | 1 | Lecture des votes d’une version : contrat de consultation adjacent ; à reprendre séparément. |
| `frontOffice/customPage/customPage.cy.ts` | 1 | URL personnalisée : hors contrat d’identité. |
| `frontOffice/multilangue/multilangue.cy.ts` | 6 | Langue et configuration multilingue : l’authentification de certains cas est une précondition ; les motifs de désactivation restent à diagnostiquer dans ce périmètre. |

Ces cas ne sont pas réactivés sans validation de leur comportement. Ce lot ne certifie pas leur couverture.

### Découverte et validation locale

- Les deux globs frontend correspondent exactement aux **548 fichiers** découverts par Jest : **519 `.tsx` et 29 `.ts`**, dont `frontend/js/redux/modules/user-test.ts`. Les 29 suites `.ts` passent : **92 tests, 17 snapshots**.
- Le runner admin-next découvre **77 fichiers**. Les runners GraphQL découvrent **236 mutations et 197 queries**, sans écart avec leurs globs CircleCI.
- `bin/phpunit --list-tests`, exécuté dans le conteneur applicatif avec la configuration habituelle, découvre **191 classes concrètes et 1 138 scénarios**. Le glob CircleCI `tests/**/*Test.php` conserve l’exclusion existante de `MigrationCommandTest.php` et couvre les suites ajoutées dans les parties précédentes. Cette commande vérifie la découverte, pas leur réussite.
- Le contrôle de couverture Cypress passe. Le YAML CircleCI est parsé et ses dépendances de workflow sont vérifiées localement ; cela ne remplace pas une validation par CircleCI.
- ESLint des deux specs et du plugin temporairement corrigé, Prettier des fichiers de code/configuration modifiés et `git diff --check` passent. ESLint conserve son avertissement de configuration sur la version React. La modification du plugin a ensuite été retirée ; les contrôles de formatage et de diff ont été revérifiés après cet ajustement.
- Avec la correction temporaire du namespace des flags, `shield` et `search` passent : **6/6 scénarios sans retry**, avec les assets issus de `yarn build`. Ces résultats ne constituent pas un rejeu après retrait de cette correction.

Le build de développement par défaut `yarn build` compile avec deux avertissements, sans modification de Webpack, Babel ou `tsconfig.json`. Les trois workflows User/Participant passent avec ces assets et la correction temporaire du plugin : **9/9 scénarios sans retry**, en 4 min 7 s. Leur rejeu sur le code final reste à effectuer après intégration de #20296 dans la base. L’erreur historique `graphql: Unexpected invocation` n’est pas reproduite sur ces parcours avec la configuration actuelle. Le build de production et la CI distante ne sont pas validés par ce contrôle local.

Aucun push ni lancement de pipeline distant n’est effectué dans ce lot. La réussite des jobs et leur répartition réelle en CI restent à confirmer avant de clôturer la partie 6. La validation finale des tests User/Participant en partie 7 reste à effectuer ; les décisions sur les lacunes produit et le chantier `18981-remove-fos-user` restent distincts.

## Critères de clôture de la remise en état des tests User/Participant

- aucun `.only` et aucun `.skip` non documenté sur le périmètre ;
- dépendances internes réduites lorsque les contrats publics existants le permettent ; exceptions imposées par la production documentées, sans refonte de production ;
- table `fos_user`, colonnes et données existantes conservées ; SQL de préparation et de vérification autorisé, avec isolation et restauration ;
- routes, erreurs et contrats publics actuels caractérisés sans renommage ni modification de production ;
- contrats PHPSpec utiles du périmètre User/Participant migrés vers PHPUnit ;
- matrice locale complète : inscription, confirmation, login/logout, password reset/change, magic link et états du compte ;
- matrice SSO minimale complète pour chaque fournisseur activé ;
- `User`, `Participant` et les reconcilers caractérisés au niveau domaine/service ;
- mutations GraphQL User/Participant couvertes par leurs sorties et codes d'erreur ;
- parcours Cypress courts et représentatifs, avec base restaurée et préparations compatibles avec le schéma SQL conservé ;
- CI exécutant réellement les fichiers PHPUnit/Jest/Cypress concernés.

## Index initial des emplacements retenus — 25 septembre 2026

Cet index complète la carte fonctionnelle initiale ci-dessus ; les specs migrées depuis ont été supprimées et leurs remplacements sont décrits dans les comptes rendus. Un snapshot appartient au même contrat que son fichier de test parent. Les tests qui utilisent seulement `loginAs`/`directLoginAs` pour préparer une autre fonctionnalité ne sont pas inclus.

### PHPUnit

- authentification fédérée : `tests/Authentication/**`, `tests/Controller/Site/SSOControllerTest.php`, `tests/EventListener/FranceConnectLogoutSubscriberTest.php`, `tests/EventListener/OpenIdCallbackTargetPathSubscriberTest.php` ;
- cycle du compte : `tests/Command/AnonymizeUsersAutomatedCommandTest.php`, `DeleteUserArchiveCommandTest.php`, `RemindUserAccountConfirmation*Test.php`, `tests/Mutation/AnonymizeAccountByEmailMutationTest.php`, `RemoveSsoConnectionMutationTest.php` ;
- User/Participant et sorties : `tests/Command/Export*ParticipantsCommandTest.php`, `ExportUsersCommandTest.php`, `ExportUserGroupsCommandTest.php`, `RecalculateUsersCountersCommandTest.php`, `tests/Normalizer/ParticipantNormalizerTest.php`, `tests/Normalizer/Debate/*Participant*Test.php` ;
- résolution et autorisation : `tests/GraphQL/Resolver/Query/QueryUsersResolverTest.php`, `tests/GraphQL/Resolver/User/**`, `tests/GraphQL/Resolver/Proposal/ProposalAuthorEmailResolverTest.php`, `tests/Service/GroupServiceTest.php`, `ParticipantAccessResolverTest.php`, `ProjectContributorSearchTest.php` ;
- passage Participant → User : `tests/Service/ProposalReconcillierTest.php`, `ReplyReconcilierTest.php`, `tests/Mutation/SendParticipantEmailWorkflowMutationTest.php` ;
- invitations, archives et messages de compte : `tests/Processor/User/**`, `tests/Processor/UserArchive/**`, `tests/Processor/UserInvite/**` ;
- tokens/API et session : `tests/Command/CreatePublicApiTokenCommandTest.php`, `tests/PublicApi/PublicApiKeyAuthenticatorTest.php`, `tests/UserBundle/Security/**` ;
- adjacents à revalider : `tests/EmailingCampaignRecipients/EmailingCampaignRecipientsTest.php` et les processors/notifiers qui différencient destinataire enregistré, Participant ou anonyme.

### PHPSpec à migrer

- tout `spec/Capco/UserBundle/**` ;
- mutations de compte : `RegisterMutationSpec.php`, `DeleteAccountMutationSpec.php`, `UpdateProfileAccountEmailMutationSpec.php`, `UpdateProfilePersonalDataMutationSpec.php`, `Profile/UpdateProfilePasswordMutationSpec.php`, `Sms/SendSmsPhoneValidationCodeMutationSpec.php`, `Sms/VerifyUserPhoneNumberMutationSpec.php` ;
- identité anonyme/Participant : `Encoder/DebateAnonymousParticipationHashEncoderSpec.php`, `Mutation/Debate/RemoveDebateAnonymousVoteMutationSpec.php`, `Mutation/UpdateUserReplyMutationSpec.php`, `Resolver/EventParticipant/IsViewerParticipatingAtEventResolverSpec.php` ;
- resolvers User : tout `spec/Capco/AppBundle/GraphQL/Resolver/User/**`, plus `UserIsGrantedResolverSpec.php`, `Questionnaire/UserHasReplyResolverSpec.php`, `Requirement/*Viewer*Spec.php` et les resolvers `*Viewer*` dont le résultat dépend de l'identité ;
- autorisations : `spec/Capco/AppBundle/Security/*VoterSpec.php`, `CanSetOwnerSpec.php`, `GraphQL/Resolver/Ownerable/OwnerableCreatorAccessResolverSpec.php` ;
- invitations et activité : `Notifier/UserInviteEmailMessageNotifierSpec.php`, `Model/UserActivitySpec.php`, `EventListener/AuthenticationHandlerSpec.php`, `EventListener/EmptyUsernameListenerSpec.php` ;
- dépendances FOS adjacentes déjà listées : `AddCommentMutationSpec.php`, `ProposalResponsesResolverSpec.php`, `ReplyResponsesResolverSpec.php`, `ImportProposalsFromCsvSpec.php` et `OrganizationControllerSpec.php`.

### Jest GraphQL

- mutations : `internal/Mutation/Account/**`, `AnonymousReply/**`, `Authentication/**`, `Group/**`, `Organization/*Invitation*`, `User/**`, `UserIdentification/**`, `UserIdentificationCodeList/**`, `UserNotificationConfiguration/**`, `UserType/**`, `Sso/**`, ainsi que `cancelEmailChange.js`, `cancelUserInvitations.js`, `inviteUsers.js`, `updateParticipant.js`, `updateProfile.js`, `updateUser.js`, `verifyUserPhoneNumber.js`, `Other/register.js`, `Other/requestUserArchive.js` et `Other/update/updateProfile*.js` ;
- identité anonyme : les mutations `internal/Mutation/Debate/*Anonymous*` et leurs confirmations par e-mail ;
- queries : `internal/Query/User/**`, `internal/Query/Participant/**`, `internal/Query/Group/**`, `Query_participantPersonalData.js`, `Query_participants.js`, `Query_eventParticipantPersonalData.js`, `Query_ssoConfigurations.js`, `Query_userInvitations*.js`, `Query_userTypes.js` ;
- API publique : `public/Mutation/deleteAccountByEmail.js`, `public/Query/Query_users.js`, `Query_viewer.js`, `Query_notificationsFromEmail.js` et `public/Query/User/**` ;
- contrats liés à la participation : queries `*userHasVote*`, `*userHasReply*`, `*viewer*`, `*requirements*`, ainsi que les mutations Mediator qui préparent un User avec téléphone vérifié.

### Jest UI

- tout `frontend/js/components/User/**/*-test.tsx` et `frontend/js/redux/modules/user-test.ts` ;
- tout `admin-next/shared/login/*-test.tsx` et `admin-next/shared/register/*-test.tsx` ;
- administration de l'inscription : `frontend/js/components/Admin/Registration*-test.tsx` ;
- SSO et inscription à un événement : `frontend/js/components/Page/SSOSwitchUserPage-test.tsx`, `frontend/js/components/Event/UserRegister/UserRegister-test.tsx` ;
- groupes et sélection de User : `Project/Page/UserGroupModal-test.tsx`, `UserInGroupModal-test.tsx`, `Form/SelectUserList-test.tsx`, `Tag/TagUser/TagUser-test.tsx` ;
- exigences et Participant : `Requirements/RequirementsFormLegacy-test.tsx`, `Admin/Project/ProjectAdminParticipantTab/**` ;
- vues de contenu rattaché au profil : tests `*Profile*`, `*UserVote*`, `*Author*` uniquement lorsqu'ils vérifient la visibilité ou les droits liés à l'identité.

### Cypress

- compte et profil : `frontOffice/user/{account,emailConfirmation,login,profile,sso,user}.cy.ts`, `frontOffice/userProfile/userProfile.cy.ts`, `backOffice/user/userBO.cy.ts` ;
- invitations/groupes/types : `backOffice/invitation/userInvite.cy.ts`, `frontOffice/invitation/*.cy.ts`, `backOffice/userGroup/*.cy.ts`, `backOffice/userType/userType.cy.ts` ;
- Participant et réconciliation : `frontOfficeWorkflow/*.cy.ts`, `frontOffice/debate/{anonymousVote,voteToken}.cy.ts`, `frontOffice/event/eventRegistration.cy.ts` ;
- règles d'accès/compte : `frontOffice/shield.cy.ts`, `frontOffice/publicPages/tokenRoutes.cy.ts` et les cas d'identité de `frontOffice/questionnaire/questionnaireLoggedInAsUser.cy.ts` ;
- `frontOffice/rgpd/rgpd.cy.ts` est adjacent : il teste le consentement cookie du navigateur, pas le consentement persistant du User.

## Commandes de contrôle recommandées

```bash
# Direct PHP bundle dependencies; SQL references to fos_user remain valid
rg -n 'FOS\\+UserBundle|FOSUserBundle' \
  tests spec features cypress frontend admin-next config/packages/test

# Review bundle-provided configuration and public contracts; do not require renaming
rg -n '%fos_user\.|fos_user_|fos_user\.' \
  tests spec features cypress frontend admin-next config/packages/test

# Tests focalisés ou ignorés
rg -n '\b(describe|context|it|test)\.(only|skip)\b|\b(xdescribe|xit|xtest)\b|markTestSkipped' \
  tests spec features cypress frontend admin-next

# Frameworks non cibles
find spec -type f -name '*Spec.php'
find . -type f -name '*.feature' -not -path './vendor/*' -not -path './node_modules/*'
```

Cet audit vise la fiabilité et la couverture des tests User/Participant avec la production actuelle. Les tests peuvent vérifier explicitement le schéma `fos_user` et les contrats publics existants. La suppression de FOSUserBundle et la stack de 11 branches `18981-remove-fos-user` seront traitées séparément, ultérieurement.

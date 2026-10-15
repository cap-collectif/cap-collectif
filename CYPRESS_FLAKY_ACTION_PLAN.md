# Plan d’action pour diagnostiquer et corriger les tests Cypress intermittents

## Mission pour l’IA qui reprend

Identifier les tests qui accèdent au DOM avant la fin du chargement dont ils
dépendent, reproduire leur échec, puis apporter un correctif ciblé. Chercher aussi
les problèmes d’isolation, de session et de fixtures lorsque les traces les
indiquent. Ne pas appliquer une transformation automatique à toute la suite :
un élément absent peut venir d’une erreur API ou d’une redirection.

Lire `AGENTS.md`, `CONTEXT.md` et `ADR/001-frontend_tests.md` avant de modifier
les tests. Respecter les modifications déjà présentes dans le checkout. Consulter
les ADR pertinents si le correctif touche au code applicatif.

## Point de départ et niveau de preuve

Les six specs signalées sont :

| Spec sous `cypress/e2e/` | État de l’investigation |
| --- | --- |
| `backOffice/questionnaire/questionnaireImportChoices.cy.ts` | Défaut de synchronisation reproduit et correctif présent ; spec passée dans le run groupé du 13 octobre. Cause exacte du run CI non confirmée. |
| `backOffice/moderation/comment.cy.ts` | Gestionnaire qui masquait toutes les exceptions retiré ; statut HTTP et erreurs GraphQL de la query d’administration vérifiés. Spec passée, cause CI non confirmée. |
| `backOffice/themeSettings/themeSettings.cy.ts` | Attente et vérifications de la query de la liste ajoutées. Reproduction locale avec délai de 17 s : version sans attente échoue sur `themes.metadescription` après 15 s ; version corrigée passe. Cause exacte CI non confirmée. |
| `frontOffice/event/eventsList.cy.ts` | Attentes ajoutées sur la query initiale et les refetchs déclenchés par les filtres ; assertions sur le loader transitoire retirées. Spec passée, cause CI non confirmée. |
| `frontOffice/event/eventRegistration.cy.ts` | La visite attend maintenant `EventPageQuery`, qui fournit les données utilisées, au lieu de `CommentSectionQuery`. Reproduction locale avec `CommentSectionQuery` retardée de 31 s : l’ancienne attente expire après 30 s ; la version corrigée passe (3/3). Cause exacte CI non confirmée. |
| `frontOffice/invitation/organizationInvitation.cy.ts` | Aucun défaut de synchronisation démontré ; spec passée sans modification. Cause CI non confirmée. |

Le 13 octobre 2026, les six specs ont passé deux fois en local, sans retry
(28 exécutions de tests réussies). Cela ne suffit pas à établir leur stabilité
en CI. Les jobs Cypress concernés tournent sur CircleCI ; les runs GitHub
Actions ne fournissent pas ces traces. L’accès CircleCI n’était pas disponible
pendant cette investigation : demander les extraits d’erreur ou les artefacts
à l’utilisateur si nécessaire.

Un nouvel incident a ensuite été signalé pour
`frontOffice/opinion/opinionVersion.cy.ts` ; il est consigné dans le bilan du
14 octobre.

### Cas déjà reproduit : import des choix du questionnaire

Le XML CI fourni indique :

```text
Timed out retrying after 15000ms:
Expected to find element: `#parameters-submit`, but never found it.
```

L’échec arrive immédiatement après la visite, avant tout import CSV.
`frontend/js/components/Questionnaire/QuestionnaireAdminPage.tsx` affiche un
loader tant que les données du questionnaire ne sont pas disponibles.

Le test interceptait `QuestionnaireAdminPageQuery`, mais attendait sa réponse
seulement après les imports. En retardant uniquement cette réponse de
17 secondes, le test initial a produit exactement le même message d’erreur.
Après déplacement de l’attente avant l’accès au formulaire, cette reproduction
a passé. La version finale a aussi passé en conditions normales et avec ESLint.

Le correctif attend désormais la requête au bon endroit et vérifie le statut
HTTP, l’absence d’erreurs GraphQL et la présence du questionnaire et du viewer.
Le délai temporaire a été retiré. Aucun timeout global n’a été augmenté.

**Limite :** cette expérience prouve la vulnérabilité à une réponse lente,
mais ne prouve pas que le run CI fourni a rencontré cette lenteur. Une erreur
GraphQL ou une redirection pourraient aussi expliquer l’élément absent.

## 1. Préparer un environnement reproductible

1. Lire `git status` et préserver les changements existants.
2. Vérifier les services locaux et l’accès à `https://capco.test`.
3. Vérifier que `admin-next/.env.local` contient, sans commentaire :
   `NEXT_PUBLIC_SYMFONY_ENV=test`. Pour une première installation, suivre
   `doc/installation-locale.md`.
4. Exécuter `corepack enable` avant toute commande Yarn.
5. Lancer Cypress depuis `cypress/`, où le plugin résout ses chemins relatifs.
6. Vérifier les retries effectivement appliqués : `cypress.config.ts` configure
   deux retries en mode run, tandis que `cypress.development.json` les remplace
   par zéro pour `yarn cy:run` local. Le résumé doit confirmer les tentatives.

```bash
corepack enable
cd cypress
yarn cy:run --spec e2e/backOffice/questionnaire/questionnaireImportChoices.cy.ts
```

Utiliser Castor pour les tâches projet. Tout exécutable PHP doit tourner dans
le conteneur application, selon le wrapper défini dans `AGENTS.md`.

### Attention aux données entre deux lancements Cypress

Lire `cypress/plugins/index.ts` et `.castor/shared/qa.php` avant de répéter les
runs. En local, le hook `before:run` sauvegarde la base et Elasticsearch.
`db:restore` restaure ensuite ces sauvegardes, pas nécessairement les fixtures
vierges. Si le run précédent a créé une question ou une inscription, le run
suivant peut sauvegarder cet état modifié comme nouveau point de départ.

Après un run qui modifie les données, restaurer le snapshot initial **avant**
le prochain lancement. Employer les tâches locales prévues à cet effet :

```bash
castor local:qa:restore-db --confirm
castor local:qa:restore-es-snapshot --confirm
```

Vérifier auparavant que les snapshots correspondent bien aux données de test
attendues. Ne pas lancer un reset global de l’environnement pour contourner
un échec sans comprendre l’état nécessaire au scénario.

**Ne pas utiliser `CI_SHARED_TEST_DATA=1` pour seulement éviter la sauvegarde
locale.** Cette variable change aussi les chemins et les modalités de
restauration MySQL/Elasticsearch. Une tentative durant cette investigation a
échoué dans `db:restore` parce que le dépôt Elasticsearch CI était indisponible
en local. Cet échec ne constitue pas une reproduction des flakes signalés.

## 2. Construire un inventaire priorisé

Commencer par les cinq specs restantes, puis élargir aux autres suites et aux
helpers communs. Ces recherches trouvent des candidats, pas des bugs prouvés :

```bash
rg -n 'cy\.visit|Base\.visit|interceptGraphQLOperation|cy\.wait' cypress/e2e cypress/pages cypress/support
rg -n 'cy\.wait\([0-9]|force: true|uncaught:exception|\.loader' cypress/e2e cypress/pages cypress/support
rg -n 'before\(|beforeEach\(|directLoginAs|db:restore|enable:feature|disable:feature' cypress/e2e
```

Pour chaque candidat, relever : la spec, l’action, l’assertion qui suit,
l’opération réseau dont elle dépend, la preuve disponible et le prochain
essai permettant de départager les causes. Inspecter notamment :

- Interception enregistrée après la visite ou le clic qui déclenche la requête.
- Interception présente mais attente placée après les premières assertions.
- Attente d’une query de navbar utilisée comme preuve de chargement du contenu.
- Assertion sur l’apparition obligatoire d’un loader transitoire.
- Assertion satisfaite par les anciennes données avant la fin d’un filtrage.
- Attente fixe utilisée pour un calcul asynchrone, une lecture de fichier ou
  une mutation dont on pourrait observer l’achèvement.
- Authentification faite dans `before()` alors que `testIsolation: true`
  réinitialise l’état navigateur entre les tests.
- Validation d’une session fondée uniquement sur l’existence d’un cookie.
- Données ou feature flags laissés par les scénarios précédents.

Lire l’implémentation des helpers, notamment `cypress/pages/base.ts`,
`cypress/support/graphql.ts`, `cypress/support/auth.ts` et
`cypress/pages/event/`. Ne pas supposer que leur nom garantit leur comportement.

## 3. Diagnostiquer chaque candidat avec une preuve

1. Récupérer l’erreur exacte de la tentative échouée, la capture et, si
   disponible, le log applicatif. Un XML avec `failures="0"` ne documente pas
   nécessairement les tentatives qui ont échoué avant un retry réussi.
2. Classer l’échec : préparation des fixtures, visite HTTP, attente réseau,
   réponse GraphQL, assertion DOM ou interaction.
3. Exécuter la spec seule sans retry avec des données initiales connues.
4. Si nécessaire, rejouer dans l’ordre des specs voisines du même conteneur CI
   pour tester un effet de bord. Plusieurs lancements simultanés contre la
   même base locale rendraient le diagnostic ambigu : les éviter.
5. Énoncer plusieurs hypothèses falsifiables avant de corriger. Par exemple,
   une réponse lente, une session invalide et une fixture contaminée doivent
   produire des observations différentes.
6. Modifier une seule variable pour départager les hypothèses. Un délai
   injecté dans une réponse réelle permet d’éprouver une course de chargement.
7. Comparer la reproduction à la trace CI : même assertion, même étape,
   même message. Signaler clairement toute différence.

Exemple temporaire pour éprouver la dépendance à une réponse lente :

```ts
cy.interceptGraphQLOperation(
  { operationName: 'QuestionnaireAdminPageQuery' },
  req => {
    req.continue(res => {
      res.setDelay(17000)
    })
  },
)
```

Adapter l’opération et le délai au scénario. Préserver la réponse réelle pour
tester le parcours applicatif. Vérifier que les timeouts réseau permettent
l’expérience ; une expiration réseau différente serait un autre symptôme.
Retirer cette instrumentation après validation.

Si aucune reproduction ni trace exploitable n’est disponible, présenter le
candidat comme une piste. Demander les éléments manquants et poursuivre sur
les autres candidats documentés, sans annoncer une cause confirmée.

## 4. Corriger la dépendance observée

Pour une course de chargement :

1. Identifier la requête qui fournit effectivement les données de l’élément.
2. Enregistrer son interception avant l’action qui la déclenche.
3. Attendre sa réponse immédiatement avant l’utilisation des données.
4. Vérifier les erreurs HTTP et GraphQL utiles au diagnostic.
5. Vérifier ensuite l’état DOM final et l’interactivité du contrôle.

Exemple inspiré du correctif existant :

```ts
cy.interceptGraphQLOperation({ operationName: 'QuestionnaireAdminPageQuery' })
cy.visit('/admin/capco/app/questionnaire/questionnaireAdmin/edit')
cy.wait('@QuestionnaireAdminPageQuery').its('response').as('questionnaireResponse')
cy.get('@questionnaireResponse').its('statusCode').should('eq', 200)
cy.get('@questionnaireResponse').its('body').should('not.have.property', 'errors')
cy.get('@questionnaireResponse').its('body.data.questionnaire').should('exist')
cy.get('@questionnaireResponse').its('body.data.viewer').should('exist')
cy.get('#parameters-submit').should('be.visible')
```

Choisir les assertions selon le contrat réel de l’opération : certains
scénarios attendent une erreur métier. Un HTTP 200 seul ne garantit pas le
succès GraphQL. Les assertions Cypress évitent ici les règles Jest qui
interprètent les `expect` Chai comme des assertions Jest.

`Base.visit({ path, operationName })` peut convenir si l’opération correspond
bien au contenu attendu. Pour plusieurs requêtes indépendantes, attendre
les dépendances nécessaires : leur ordre d’émission ne garantit pas leur
ordre de réponse. Pour un filtrage ou une mutation, distinguer la requête
initiale de celle déclenchée par l’action ; utiliser un alias spécifique ou
vérifier les variables afin de ne pas consommer une réponse ancienne.

Pour les autres causes : corriger l’isolation ou la restauration de session
si elles sont prouvées ; remplacer une assertion sur un loader éphémère par
une attente de réponse et une assertion sur les résultats ; attendre un
résultat observable du traitement CSV au lieu d’un délai fixe.

Ne pas masquer l’échec avec une augmentation générale des timeouts, des
retries supplémentaires, un `force: true`, un `.skip()` ou un gestionnaire
global qui ignore toutes les exceptions. Une erreur applicative réelle doit
être diagnostiquée et corrigée à sa source.

## 5. Valider et livrer par petits lots

- Faire échouer la version initiale avec la reproduction ciblée.
- Faire passer la version corrigée avec la même perturbation.
- Retirer les sondes temporaires, puis exécuter la spec normale sans retry.
- Répéter avec le même état initial ; rejouer les specs voisines si la cause
  concerne l’isolation ou un helper partagé.
- Exécuter ESLint sur les fichiers touchés et `git diff --check`.
- Vérifier que les nouvelles specs sont couvertes par les patterns CircleCI
  si une spec permanente est ajoutée. Le contrôle existant est
  `.circleci/check-cypress-spec-coverage.sh`.
- Respecter les contrôles PHP obligatoires de `AGENTS.md` avant tout commit
  contenant des changements PHP.
- Vérifier qu’aucun délai injecté, log de diagnostic, `.only()` ou `.skip()`
  temporaire ne subsiste, puis restaurer les données de reproduction.

Commandes de validation d’une spec, depuis `cypress/` :

```bash
yarn cy:run --spec e2e/backOffice/questionnaire/questionnaireImportChoices.cy.ts
yarn exec eslint e2e/backOffice/questionnaire/questionnaireImportChoices.cy.ts
git diff --check
```

Conserver pour chaque correctif un bilan court : symptôme CI, cause démontrée,
reproduction avant/après, fichiers modifiés, validations et limites. Lorsqu’un
test de régression permanent apporte une couverture utile, l’ajouter à la
bonne frontière ; éviter de dupliquer tout un parcours E2E seulement pour
conserver une sonde de lenteur.

Un cas est terminé lorsque la reproduction initiale passe avec le correctif,
que le parcours normal passe et que l’instrumentation est retirée. Les autres
cas restent explicitement « à diagnostiquer » tant que les preuves manquent.

## Bilan d’exécution — 13 octobre 2026

- Run groupé des six specs : **14 tests réussis, 0 échec**, avec `cypress.development.json` qui configure zéro retry.
- Reproduction contrôlée de la spec des paramètres de thème : en retardant `ThemeSettingsListQuery` de 17 secondes, la version sans attente échoue avec `Timed out retrying after 15000ms: Expected to find content: 'themes.metadescription' but never did.` Après ajout de l’attente réseau et des contrôles HTTP/GraphQL, la même perturbation passe (2/2). La sonde de délai a été retirée.
- Reproduction contrôlée de l’inscription événement : en retardant `CommentSectionQuery` de 31 secondes, l’ancienne visite expire après 30 secondes en attendant cette requête secondaire. Après remplacement par l’attente de `EventPageQuery`, le parcours passe sous la même perturbation (3/3). La sonde de délai a été retirée.
- Après retrait des deux sondes, les specs thème et inscription événement passent de nouveau sans perturbation (5/5).
- ESLint sur les six specs et `git diff --check` passent. Aucun `.only()`, `.skip()` ni délai injecté ne subsiste dans les specs ciblées.
- La DB et Elasticsearch locales ont été restaurées depuis leurs snapshots après les runs.
- Les traces CircleCI des tentatives échouées ne sont pas disponibles. La reproduction du thème démontre une vulnérabilité à une réponse lente, mais ne confirme pas que c’est la cause du run CI. Les autres specs passées en local restent des pistes non confirmées quant à leur cause CI.

## Bilan d’exécution — 14 octobre 2026

- La trace de `opinionVersion.cy.ts` échoue sur `#opinion-delete` après le test de l’auteur. La capture CI associée montre les boutons « connexion » et « inscription » dans l’en-tête, alors que `OpinionVersion.yaml` attribue `version1` à `user@test.com`. Elle indique que le navigateur était dans un état non authentifié au moment de l’échec.
- Le scénario utilise maintenant le login navigateur (`cy.loginAs`) au lieu du helper basé sur `cy.session`, puis vérifie l’état connecté avec `cy.isLoggedIn()` avant de cliquer sur le bouton. Le scénario de suppression passe dans les deux runs locaux après ce changement. Le run initial avant changement passait également : l’incident exact n’a donc pas été reproduit localement et la raison de l’état anonyme CI reste à confirmer.
- La spec complète a échoué deux fois sur un autre scénario, `As an admin should allow a non-author to report a version`, avec `Timed out ... #reportType`. Ce problème est indépendant de la suppression d’une version et reste à diagnostiquer.
- La base et Elasticsearch locales ont été restaurées depuis les snapshots après les runs.

### Diagnostic de `user/userBO.cy.ts` et du helper de connexion

- Sur le job CircleCI `1742181` (commit `eb5b261188`), les trois scénarios
  super-admin échouent sur des contrôles absents. La capture du premier échec
  montre l'accueil anonyme ; les logs PHP confirment que la visite du profil est
  refusée pour absence d'authentification et redirigée vers l'accueil.
- Défaut reproduit du helper : après une connexion puis une déconnexion côté
  serveur, `directLoginAs` accepte son cookie mis en cache alors que `viewer`
  est nul. Sa validation ne vérifiait que l'existence de `PHPSESSID`.
- `directLogin` vérifie désormais le succès du login et l'identité de `viewer`
  via l'API. Il ne charge plus l'accueil pendant la création de session :
  `cy.request` utilise directement `baseUrl`, sans lancer le frontend anonyme.
  La visite d'un profil vérifie l'URL et `UserAdminPageQuery` avant le formulaire.
- La nouvelle spec `directLogin.cy.ts` échoue sur deux scénarios avant le correctif
  (accueil indisponible et session serveur invalidée), puis passe les trois
  scénarios après le correctif. `userBO` passe ses quatre scénarios ; l'enchaînement
  `post → userBO` passe aussi (15 tests), sans retry.
- **Limite de preuve :** cinq essais locaux avec des connexions fraîches n'ont
  pas reproduit la perte initiale CI. La validation insuffisante est démontrée,
  mais une course entre les requêtes de l'accueil et le login reste une hypothèse.
  Le prochain run CI doit confirmer le résultat ; aucun correctif de gestion
  des sessions serveur n'a été apporté sur la base de cette hypothèse seule.

### Isolation des tests de visibilité des propositions

- Le job frontoffice `1742180` refuse la connexion parce que `user@test.com`
  n'existe plus. Les deux tests de visibilité étaient hors du `describe` portant
  le reset DB et pouvaient hériter de l'anonymisation finale de `profile.cy.ts`.
- Reproduction ciblée : anonymisation du compte puis les deux tests de visibilité,
  dans l'ordre CI. Avant correction, le scénario du compte ordinaire échoue en 401.
  Après déplacement du hook au contexte parent, les trois scénarios passent,
  sans retry. Les sélections temporaires `.only` ont été retirées.

### Disponibilité Next.js pour les invitations

- Le job `1742181` renvoie un 502 pendant la visite de `/admin-next/invite`,
  avant la query GraphQL. Le service CI lance `next build` puis `next start`
  en arrière-plan sans contrôle de disponibilité préalable.
- Le bootstrap Cypress backoffice attend désormais une réponse 2xx/3xx via le
  même proxy, avec une limite de cinq minutes. Une indisponibilité persistante
  reste un échec explicite de préparation. Le contrôle a été vérifié avec
  connexion refusée, 502 transitoires, redirection valide et 502 persistant.
- Le proxy local répond 302 et les huit scénarios d'invitation passent sans retry.
  Les logs Next.js/Nginx du run CI initial ne sont pas disponibles : l'absence
  de contrôle de démarrage est corrigée, mais un redémarrage en cours de test
  reste une autre cause possible de 502 à surveiller au prochain run.

### Indexation des arguments modérés

- Le helper lançait le consommateur Swarrot en arrière-plan et rendait la main
  immédiatement. Le reload pouvait donc lire l'ancien index, puis conserver
  l'argument dans le DOM malgré la fin du traitement.
- Reproduction contrôlée : retarder le lancement du consommateur de huit secondes
  reproduit l'échec CI sur l'argument encore présent après le reload.
- La tâche attend maintenant la consommation bornée et l'acquittement de tous les
  messages de la file. Elle est appelée après la modération, avant le reload.
  Un timeout ou une erreur du consommateur fait échouer le test explicitement.
- Les huit scénarios de modération passent sans retry. Le scénario initial passe
  aussi avec le même délai de huit secondes après correction. La sonde et la
  sélection temporaire `.only` ont été retirées ; ESLint passe.

### Isolation Redis de la configuration du mode privé (GraphQL)

- Les jobs mutations `1742497` et `1742519` échouent sur `cropMedia.js` avec
  `Could not find MIME for Buffer <null>`, après `shieldConfig.js` sur le même shard.
- Reproduction minimale : exécuter `shieldConfig` puis `cropMedia` dans cet ordre
  reproduit exactement l'échec. Le mode privé reste actif dans Redis malgré le
  reset MySQL ; le téléchargement anonyme du JPEG reçoit HTTP 200 `text/html`
  contenant la page du mode privé au lieu de l'image.
- `shieldConfig.js` désactive désormais `shield_mode` dans un `afterEach` attendu,
  conformément au preset test. Les deux specs passent dans l'ordre CI après
  correction (2/2). Une assertion volontairement échouée après la mutation
  confirme aussi que le nettoyage s'exécute et que `cropMedia` passe ensuite.
- Le replay large a été interrompu au profit de cette reproduction minimale.
  La sonde de panne et le séquenceur temporaire ont été retirés du code livré.

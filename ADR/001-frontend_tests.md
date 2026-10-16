# ADR 001 — Tests front-end avec Cypress

# Tests front-end avec Cypress

## Contexte
Le projet nécessite des tests end-to-end et d'intégration afin d'assurer la qualité, la non-régression et la confiance lors des déploiements.

## Décision
Utiliser Cypress pour les tests front-end (E2E + intégration).
Cypress est choisi pour sa stabilité, son ergonomie et son intégration avec les frameworks modernes.

## Structure
Afin de garantir que les tests soient bien joués dans la CI, il est nécessaire de les ajouter dans l'un des dossiers suivants
- cypress/
    - e2e/
        - frontOffice/
        - backOffice/


## Convention de nommage
Nommage : `featureNameInCamelCase.cy.ts`

## Statut des tests et sources de référence

Les tests existants ne sont pas tous des exemples à reproduire. Leur présence dans
`cypress/e2e/` ne signifie pas qu'ils respectent les conventions actuelles.

Chaque statut décrit l'état d'un fichier, d'une suite (`describe`) ou d'un test (`it`).
Le statut doit être posé au niveau le plus précis possible : ne pas marquer tout un
fichier si seule une suite est concernée.

- `reference` : exemple canonique respectant les conventions actuelles. Seuls ces
  tests doivent servir de modèle pour écrire un nouveau test.
- `compliant` : test conforme, mais qui n'a pas été retenu comme exemple canonique.
- `non-compliant` : test encore utile, mais qui ne respecte pas une ou plusieurs
  conventions actuelles. Il ne doit pas être copié pour un nouveau test.
- `legacy` : test fondé sur une ancienne approche, une ancienne architecture ou un
  workaround qui doit être migré. Un test non conforme n'est pas automatiquement
  legacy.
- `obsolete` : test ou comportement qui n'est plus supporté et doit être supprimé,
  plutôt que migré.

Un fichier entier peut être marqué si son organisation ou son setup partagé rend
l'ensemble non représentatif. Dans un fichier mixte, le statut doit être placé sur
le `describe` ou le `it` concerné. Les tests sans statut explicite ne sont jamais
considérés comme des références.

### Format du commentaire

Utiliser un commentaire JSDoc en anglais, afin qu'il soit facilement repérable par
les outils et les assistants de développement :

```ts
/**
 * @cypress-status reference
 * @cypress-reason Canonical example for GraphQL-synchronised page tests.
 */
describe('Search feature', () => {
  // ...
})
```

Pour un test non canonique, préciser la raison et le ticket de migration lorsqu'il
existe :

```ts
/**
 * @cypress-status legacy
 * @cypress-reason Uses fixed waits required by the old captcha integration.
 * @cypress-migration #1234
 */
describe('Legacy captcha workflow', () => {
  // ...
})
```

Les valeurs autorisées sont `reference`, `compliant`, `non-compliant`, `legacy` et
`obsolete`. Le commentaire seul ne remplace pas les contrôles CI : les conventions
doivent également être vérifiées automatiquement lorsque cela est possible.

### Tests de référence actuels

Les suites suivantes sont les exemples canoniques à consulter pour écrire un nouveau
test Cypress :

- `cypress/e2e/frontOffice/developer/developer.cy.ts` : navigation synchronisée avec GraphQL ;
- `cypress/e2e/backOffice/appearanceSettings/appearanceSettings.cy.ts` : accès back-office et interaction simple ;
- `cypress/e2e/backOffice/socialNetwork/socialNetwork.cy.ts` : workflow CRUD back-office ;
- `cypress/e2e/frontOffice/proposal/proposalStep.cy.ts` : affichage authentifié et filtres ;
- `cypress/e2e/frontOffice/event/eventRegistration.cy.ts` : formulaire anonyme et parcours authentifié.

### Contrôles automatiques

Le lint Cypress est lancé avec :

```bash
yarn workspace cypress lint
```

Il couvre `support`, `plugins`, `pages`, `e2e` et les règles ESLint spécifiques à Cypress.
Les règles personnalisées signalent les attentes fixes (`cy.wait(<nombre>)`), vérifient les statuts
de tests et exigent un `db:restore` dans les fichiers marqués `reference`. Les attentes fixes et le
nettoyage des feature toggles restent des warnings pour permettre la migration progressive des tests
existants. Le nettoyage des feature toggles est toutefois obligatoire pour toute nouvelle suite et
pour les tests marqués `reference`.

Une attente fixe exceptionnellement nécessaire peut être désactivée localement avec la directive
ESLint `no-fixed-wait`. La directive doit être placée juste au-dessus de l'attente et expliquer la
raison de l'exception :

```ts
// eslint-disable-next-line no-fixed-wait -- Captcha completion cannot be intercepted.
cy.wait(1000)
```

Une désactivation globale du fichier ou de la suite est à éviter : l'exception doit rester limitée
à l'attente concernée.


## Bonnes pratiques
- Isoler les tests : nettoyer l'état entre tests : faire un `cy.task('db:restore')` au début de chaque suite de test dans la fonction `before(() => {})`.
Une suite de tests peut modifier la base de données et donc l'état d'autres tests. En cas de retry, un test précédemment passé pourrait échouer pour cette raison.
On limite le `db:restore` à la suite de tests elle-même afin que si on rejoue la suite, elle retrouve sa base de données de départ;

/!\ ne pas faire un `db:restore` dans le `beforeEach()` car la DB serait restaurée avant **chaque test** sauf si nécessaire.
Le `db:restore` est obligatoire avant chaque suite de tests afin d'assurer que celle-ci pourra être relancée sans effet de bord d'une autre suite de tests. 

- DRY : Réduire la duplication de code en créant un fichier et des fonctions support si nécessaire dans le dossier `cypress/pages/` en créant un dossier pour la page concernée. Les mêmes conventions de nommage s'appliquent.

- Déterminisme : attendre que des queries partent plutôt que d'attendre un délai fixe.
--> Une fonction `Base.visit()` peut être utilisée pour visiter une page. Lui passer la dernière query à être lancée sur la page en question pour assurer que la page a fini de charger avant de tester le DOM et les interactions.

- Tests rapides : les features et pages peu utilisées sont testées de façon basique : chargement de la page, affichage d'élément. Pas besoin de faire tout le CRUD par exemple.
--> le but est d'éviter d'allonger la CI qui est longue et coûteuse.

- Utiliser les `aria-` éléments pour cibler les éléments.
--> permet de renforcer l'utilisation de ces attributs.

- Centraliser les fonctions support dans `cypress/support/` et utiliser celles déjà existantes.
--> permet d'éviter de réinventer la roue lors d'interactions, et de rendre les tests plus courts et lisibles.

- si on active un feature toggle au début de la suite de tests, le désactiver pour éviter des effets de bord sur d'autres tests.


## Documentation
https://www.cypress.io


## Notes

### Activer / désactiver un FeatureToggle

```ts
cy.task('disable:feature', 'captcha')
cy.task('enaable:feature', 'calendar')
```

### Connexion directe et sessions Cypress

`cy.directLoginAs()` se connecte avec `cy.request()` sans charger la page
d'accueil. La validation de `cy.session()` interroge l'API GraphQL interne et
vérifie que `viewer.email` correspond au compte demandé : un cookie `PHPSESSID`
présent ne prouve pas que la session serveur est encore authentifiée. Cypress
recrée une session restaurée dont cette validation échoue.

La spec `backOffice/user/directLogin.cy.ts` vérifie la connexion sans accueil,
la réutilisation d'une session valide et la reconnexion après une déconnexion
côté serveur. Les visites de profils administrateurs vérifient également leur
URL et la réponse de `UserAdminPageQuery` avant les interactions avec le formulaire.

### Attendre l'indexation asynchrone

`cy.task('swarrot:consume', 'elasticsearch_indexation')` consomme les messages
présents et attend que la file ne contienne plus de messages prêts ou non
acquittés, avec une limite de 30 secondes. Appeler cette tâche après l'action
qui publie les messages, puis recharger la page : attendre uniquement la réponse
GraphQL ne garantit pas que l'index Elasticsearch reflète déjà la mutation.
Le consommateur est borné pour ne pas rester actif pendant les resets suivants.

### Visiter une page

```ts
Base.visit('path')
```

### Attendre la fin d'une query

```ts
cy.interceptGraphQLOperation({ operationName: 'QueryName' }) // on demande à Cypress de s'attendre à devoir attendre cette query
cy.wait('@QueryName', { timeout: 10000 }) // le moment venu, on demande à Cypress d'attendre que cette query soit terminée avant de passer à l'assertion suivante
// !important : le `cy.interceptGraphQLOperation` doit obligatoirement être situé **avant** le `wait` (sinon il ne sert à rien :)) 
```

Note : par le passé, on avait énormément de tests "flaky", c'est-à-dire qui pouvaient échouer sur un même commit --> il fallait relancer la suite de tests entière pour une requête trop lente.
Pour le moment (novembre 2025), on force un timeout volontairement élevé pour éviter cela. Il est défini à 15 secondes dans `cypress.config.ts` avec la clé suivante : `requestTimeout`.
Si l'API répond avant le timeout défini, le test continue et n'attend pas la fin du timeout.
On peut également mettre un timeout personnalisé (cf exemple ci-dessus)


Il est inutile d'attendre toutes les queries, intercepter et attendre la dernière suffit, puisqu'elles sont toujours lancées dans le même ordre.


### Tester un composant transverse à plusieurs pages

Si on teste un élément visible à plusieurs endroits, **le tester sur la page la moins gourmande en données** (par ex : pour tester la `NavBar`, ne pas aller sur la homepage qui lance beaucoup de queries et fetch beaucoup de données, mais lui préférer une page comme `/legal` par exemple, bien plus rapide à charger)

### Tester la présence d'un élément cliquable

Quand on teste la présence d'un élément, si on veut le cliquer, il vaut mieux **ajouter des assertions intermédiaires pour laisser à l'élément le temps de charger correctement**.

```ts
✅ // DO
cy.get('.element-class').should('exist').and('be.visible').click()

❌ // DON'T
cy.get('.element-class').click()
```
--> vérifier l'existence puis la visibilité de l'élément avant de le cliquer permet de diminuer le risque d'échec (temps d'apparition de l'élément, transition css ou autre qui retarde la possibilité d'interagir avec, cypress est plus rapide que nous autres simples mortel·les).

Lorsqu'on clique sur un élément, on peut ajouter l'option `{ force: true }` qui force le clic même si l'élément n'est pas encore visible.
Idem pour les checkboxes, select, etc.

```ts
cy.get('.element-class').should('exist').and('be.visible').click({ force: true })
```


### WAIT en dur

Ne pas utiliser un `wait()` avec une valeur en dur, **sauf si on ne peut pas faire autrement**, par exemple quand on attend la validation d'un captcha et qu'on n'a pas de query que l'on peut listen.
```ts
✅ // DO
wait('@operationName', { timeout: 5000 })

❌ // DON'T
wait(500)
```

### Erreur `uncaught:exception` en local

Parfois, en local, lorsqu'on run Cypress, la suite de tests échoue à cause d'une `uncaught:exception` dans l'application.
En général, ça ne fait pas échouer le test dans la CI mais ça rend le développement des tests compliqué.
Pour contourner ce problème, on peut ajouter le code suivant là où le test échoue :
```ts
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    return false
})
```



### Conseils d'ordre général

- Relire sa PR avant de l'envoyer en review et vérifier qu'on n'a pas oublié un `.only()` ou `.skip()`, qui éviterait à certains tests de se lancer.
 

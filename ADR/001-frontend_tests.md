# ADR 001 — Tests front-end avec Cypress

# Tests front-end avec Cypress

## Contexte
Le projet nécessite des tests end-to-end et d'intégration afin d'assurer la qualité, la non-régression et la confiance lors des déploiements.

## Décision
Utiliser Cypress pour les tests front-end (E2E + intégration).
Cypress est choisi pour sa stabilité, son ergonomie et son intégration avec les frameworks modernes.

Les tests Behat existants sont graduellement migrés, certains relèvent du back-end ; les front-end sont migrés vers cypress.
--> Cette précision pourra être supprimée en même temps que Behat


## Structure
Afin de garantir que les tests soient bien joués dans la CI, il est nécessaire de les ajouter dans l'un des dossiers suivants
- cypress/
    - e2e/
        - frontOffice/
        - backOffice/


## Convention de nommage
Nommage : `featureNameInCamelCase.cy.ts`


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


## Documentation
https://www.cypress.io


## Notes

### Activer / désactiver un FeatureToggle

```ts
cy.task('disable:feature', 'captcha')
cy.task('enaable:feature', 'calendar')
```

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
Pour le moment (novembre 2025), on force un timeout volontairement élevé pour éviter cela.
Le temps n'est pas le temps qui est attendu, si l'API répond avant les 10000ms, le test continue.
Il est impératif de conserver ces timeouts le temps d'améliorer les performances, afin de ne pas avoir de nouveaux tests flaky.

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
 


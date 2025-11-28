import { AdminModerationPage, Base } from '~e2e-pages/index'

describe('Moderation', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })
  context('Unauthorized moderation attempts', () => {
    it('should show 404 when hacker tries to moderate with random token', () => {
      Base.visit({
        path: '/moderate/iamahackerlolilol/reason/reporting.status.sexual',
        failOnStatusCode: false,
        operationName: 'NavbarRightQuery',
      })

      cy.contains('error.404.title').should('be.visible')
    })

    it('should show 404 when moderator uses invalid reason', () => {
      Base.visit({
        path: '/moderate/opinion1ModerationToken/reason/jesuispasok',
        failOnStatusCode: false,
        operationName: 'NavbarRightQuery',
      })

      cy.contains('error.404.title').should('be.visible')
    })
  })

  context('Opinion moderation via email link', () => {
    it('should hide opinion with sexual content reason', () => {
      AdminModerationPage.interceptRedirect({
        path: '/moderate/opinion1ModerationToken/reason/reporting.status.sexual',
        redirectPath: '/projects/croissance-innovation-disruption/trashed',
      })

      cy.contains('the-proposal-has-been-successfully-moved-to-the-trash').should('be.visible')
    })

    it('should moderate opinion for guideline violation', () => {
      Base.visit({
        path: '/moderate/opinion1ModerationToken/reason/moderation-guideline-violation',
        operationName: 'OpinionSourceBoxQuery',
      })

      cy.url().should(
        'include',
        '/projects/croissance-innovation-disruption/consultation/collecte-des-avis/opinions/le-probleme-constate/opinion-1',
      )

      cy.contains('the-proposal-has-been-successfully-moved-to-the-trash').should('be.visible')

      cy.get('.has-chart', { timeout: 10000 }).should('be.visible').and('contain', 'in-the-trash')
    })
  })

  context('Version moderation via email link', () => {
    it('should hide version with sexual content reason', () => {
      AdminModerationPage.interceptRedirect({
        path: '/moderate/version1ModerationToken/reason/reporting.status.sexual',
        redirectPath: '/projects/projet-de-loi-renseignement/trashed',
      })

      cy.url().should('include', '/projects/projet-de-loi-renseignement/trashed')
      cy.contains('the-proposal-has-been-successfully-moved-to-the-trash').should('be.visible')
    })

    it('should moderate version for guideline violation', () => {
      Base.visit({
        path: '/moderate/version1ModerationToken/reason/moderation-guideline-violation',
        operationName: 'ArgumentListQuery',
      })

      cy.url().should(
        'include',
        '/projects/projet-de-loi-renseignement/consultation/elaboration-de-la-loi/opinions/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques/article-1/versions/modification-1',
      )

      cy.contains('the-proposal-has-been-successfully-moved-to-the-trash').should('be.visible')
    })
  })

  context('Argument moderation via email link', () => {
    it('should hide argument with sexual content reason', () => {
      AdminModerationPage.interceptRedirect({
        path: '/moderate/argument1ModerationToken/reason/reporting.status.sexual',
        redirectPath: '/projects/croissance-innovation-disruption/trashed',
      })

      cy.url().should('include', '/projects/croissance-innovation-disruption/trashed')
      cy.contains('the-argument-has-been-successfully-moved-to-the-trash').should('be.visible')
    })

    it('should moderate argument for guideline violation', () => {
      cy.interceptGraphQLOperation({ operationName: 'ArgumentListQuery' })
      cy.intercept('GET', '/moderate/**').as('moderate')
      cy.visit('/moderate/argument1ModerationToken/reason/moderation-guideline-violation', {
        failOnStatusCode: false,
      })

      cy.wait('@moderate', { timeout: 10000 }).then(interception => {
        cy.wrap(interception?.response?.statusCode).should('equal', 302)
      })

      cy.wait('@ArgumentListQuery', { timeout: 10000 }).its('response.statusCode').should('eq', 200)
    })
  })
})

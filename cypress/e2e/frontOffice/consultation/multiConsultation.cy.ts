import { Base } from '~e2e-pages/index'

describe('Multi Consultation', () => {
  const basePath =
    '/project/strategie-technologique-de-letat-et-services-publics/consultation/etape-de-multi-consultation'

  it('should redirect to the consultation list page if the step has many consultations', () => {
    Base.visit({ path: basePath, operationName: 'ConsultationListBoxQuery' })
    cy.url().should('eq', `${Cypress.config().baseUrl}${basePath}/consultations`)
  })

  it('back button should redirect to the consultation list page in a multi consultation step', () => {
    Base.visit({
      path: `${basePath}/consultation/deuxieme-consultation`,
      operationName: 'OpinionListQuery',
    })
    cy.get('#back-to-list-button').should('be.visible').click({ force: true })
    cy.url().should('eq', `${Cypress.config().baseUrl}${basePath}/consultations`)
  })

  it('should list the available consultations for a given step', () => {
    Base.visit({
      path: `${basePath}/consultations`,
      operationName: 'ConsultationListBoxQuery',
    })
    cy.get('.consultation__list').should('exist')
    cy.get('.consultation__preview').should('have.length', 2)
  })

  it('should allow user to share the consultation when the feature is enabled', () => {
    cy.task('enable:feature', 'share_buttons')
    Base.visit({
      path: `${basePath}/consultation/deuxieme-consultation`,
      operationName: 'OpinionListQuery',
    })
    cy.get('#share-button').should('be.visible').click({ force: true })
    cy.get('button.share-option').last().click({ force: true })

    cy.contains(
      'https://capco.test/project/strategie-technologique-de-letat-et-services-publics/consultation/etape-de-multi-consultation/consultation/deuxieme-consultation',
    ).should('be.visible')
  })
})

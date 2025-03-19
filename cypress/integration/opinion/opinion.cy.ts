import { OpinionPage } from '~e2e-pages/index'

describe('Opinion Page Tests', () => {
  before(() => {
    cy.task('db:restore')
  })

  context('As an anonymous user', () => {
    before(() => {
      cy.task('enable:feature', 'share_buttons')
    })
    it('should display all votes of an opinion', () => {
      OpinionPage.visitOpinionDetailsPage()
      OpinionPage.getShowAllOpinionVotes().click()
      cy.get('.opinion__votes__more__modal')
        .should('exist')
        .and('be.visible')
        .find('.card')
        .should('exist')
        .and('be.visible')
        .and('have.length', 29)
    })

    it('should display the opinion share dropdown', () => {
      cy.interceptGraphQLOperation({ operationName: 'OpinionPageQuery' })
      OpinionPage.visitOpinionsPage()
      OpinionPage.getSingleOpinion().find('.card__title a').click()
      cy.wait('@OpinionPageQuery', { timeout: 10000 })
      OpinionPage.getShareOpinionButton().click()

      cy.get('.share-button-dropdown').should('exist').and('be.visible')
      cy.get('.share-option').should('be.visible').and('have.length', 5)
      cy.get('.share-option').contains('share.linkedin').should('exist')
      cy.get('.share-option').eq(3).should('have.attr', 'href')
      cy.get('.share-option').eq(4).click()
      cy.get('.modal--share-link').should('exist').and('be.visible')
    })

    it('should not display error 500 on ranking step with opinions', () => {
      OpinionPage.visitRankingStepWithOpinionPage()
      cy.contains('error.500').should('not.exist')
    })
  })
})

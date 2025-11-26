import { OpinionPage } from '~e2e-pages/index'

describe('Arguments - CRUD & Permissions', () => {
  before(() => {
    cy.task('db:restore')
  })

  context('As anonymous', () => {
    it('should not see edit button on version (as anonymous)', () => {
      OpinionPage.visitVersionPage()
      cy.get('.argument__edit-button').should('not.exist')
    })

    it('should not delete argument', () => {
      OpinionPage.visitOpinionArgument()
      cy.get('.argument__delete-button').should('not.exist')

      OpinionPage.visitVersionPage()
      cy.get('.argument__delete-button').should('not.exist')
    })
  })

  context('As user', () => {
    beforeEach(() => {
      cy.directLoginAs('user')
    })

    it('should create a published argument in an opinion', () => {
      OpinionPage.visitOpinionArgument()
      cy.get('#opinion__arguments--FOR').should('contain', 'count-arguments-for')

      OpinionPage.submitArgument({ content: 'Nouvel argument publié' })
      cy.get('#opinion__arguments--FOR').should('contain', 'Nouvel argument publié')
    })

    it('should not create an argument when step is closed', () => {
      OpinionPage.visitOpinionClosed()
      cy.get('#arguments-body-FOR').should('have.attr', 'disabled')
    })

    it('should create published argument in version', () => {
      OpinionPage.visitVersionPage()
      cy.get('#opinion__arguments--FOR').should('contain', 'count-arguments-for')

      OpinionPage.submitArgument({ content: 'Nouvel argument version' })
      cy.get('.toasts-container--top div').should('contain', 'alert.success.add.argument')
    })

    it('should not create argument in closed version step', () => {
      OpinionPage.visitVersionClosedPage()
      cy.get('#arguments-body-FOR').should('have.attr', 'disabled')
    })

    it('should update argument and loses votes', () => {
      OpinionPage.visitOpinionArgument()

      OpinionPage.editArgument({ content: 'Argument mis à jour' })

      cy.get('.toasts-container--top div').should('contain', 'alert.success.update.argument')
      cy.get('.opinion__text').should('contain', 'Argument mis à jour')
      cy.get('.opinion__votes-nb').should('contain', '0')
    })

    it('should update argument in version and loses votes', () => {
      OpinionPage.visitVersionPage()
      OpinionPage.editArgument({ content: 'Màj argument version' })

      cy.get('.toasts-container--top div').should('contain', 'alert.success.update.argument')
      cy.get('.opinion__text').should('contain', 'Màj argument version')
      cy.get('.opinion__votes-nb').should('contain', '0')
    })

    it('should delete argument from opinion', () => {
      OpinionPage.visitOpinionArgument()
      OpinionPage.deleteArgument()

      cy.get('.toasts-container--top div').should('contain', 'alert.success.delete.argument')
    })

    it('should delete their argument from version', () => {
      OpinionPage.visitVersionPage()
      OpinionPage.deleteArgument()

      cy.get('.toasts-container--top div').should('contain', 'alert.success.delete.argument')
    })

    it('should not vote for their own argument (opinion & version)', () => {
      cy.task('db:restore')
      OpinionPage.visitOpinionArgument()
      OpinionPage.submitArgument({ content: 'Nouvel argument publié' })
      cy.get('#opinion__arguments--FOR').first().should('contain', 'Nouvel argument publié')
      cy.get('.opinion__votes-button > button').should('be.disabled')

      OpinionPage.visitVersionPage()
      OpinionPage.submitArgument({ content: 'Nouvel argument publié' })
      cy.get('#opinion__arguments--FOR').first().should('contain', 'Nouvel argument publié')
      cy.get('.opinion__votes-button > button').should('be.disabled')
    })

    it('should not vote on argument in closed step', () => {
      OpinionPage.visitOpinionClosed()
      cy.get('.opinion__votes-button > button').should('be.disabled')

      OpinionPage.visitVersionClosedPage()
      cy.get('.opinion__votes-button > button').should('be.disabled')
    })

    it('should not update version argument without confirming vote loss', () => {
      OpinionPage.visitVersionPage()
      OpinionPage.submitArgument({ content: 'Nouvel argument publié' })
      cy.get('#opinion__arguments--FOR').first().should('contain', 'Nouvel argument publié')
      OpinionPage.editArgumentWithoutConfirm({ content: 'Argument update' })
    })

    it('should refuse to update without confirming vote loss', () => {
      OpinionPage.visitOpinionArgument()
      OpinionPage.submitArgument({ content: 'Nouvel argument publié' })
      cy.get('#opinion__arguments--FOR').first().should('contain', 'Nouvel argument publié')
      OpinionPage.editArgumentWithoutConfirm({ content: 'Argument update' })
    })
  })

  context('As an admin', () => {
    beforeEach(() => {
      cy.directLoginAs('admin')
    })

    it('should not see edit button on version (as admin) ', () => {
      OpinionPage.visitVersionPage()
      cy.get('.argument__edit-button').should('not.exist')
    })

    it('should not delete argument (opinion & version)', () => {
      OpinionPage.visitOpinionArgument()
      cy.get('.argument__delete-button').should('not.exist')

      OpinionPage.visitVersionPage()
      cy.get('.argument__delete-button').should('not.exist')
    })

    it('should report an argument', () => {
      cy.task('enable:feature', 'reporting')
      OpinionPage.visitVersionPage()

      cy.get('.argument__btn--report').first().click({ force: true })
      cy.get('#report-form').should('be.visible')
      cy.get('#reportType').select('1')
      cy.get('#reportBody').type('Contenu offensant')
      cy.get('#report-button-submit').click({ force: true })

      cy.get('.toasts-container--top div').should('contain', 'alert.success.report.argument')
    })
  })
})

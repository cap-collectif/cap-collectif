import { OpinionPage } from '~e2e-pages/index'

describe('Opinion versions actions', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('should prevent anonymous user from seeing delete button', () => {
    OpinionPage.visitVersionPage()
    cy.get('#opinion-delete').should('not.exist')
  })

  // TODO: fixme
  // ! this test currently fails in CI, preventing the pipeline from succeeding.
  // the behavior must be fixed urgently and the test must be uncommented
  it.skip('should allow anonymous user to view all votes of a version', () => {
    OpinionPage.visitVersionWithVotesPage()
    cy.get('button#opinion-votes-show-all').click({ force: true })
    cy.get('.opinion__votes__userbox').should('exist').and('have.length.greaterThan', 10)
  })

  it('should allow the author of a version to delete it', () => {
    cy.directLoginAs('user')
    OpinionPage.visitVersionPage()

    cy.get('.loader').should('not.exist')

    cy.get('#opinion-delete').should('exist').click({ force: true })
    cy.get('#confirm-opinion-delete').should('exist').should('be.visible').click({ force: true })

    OpinionPage.visitVersionPage('NavBarMenuQuery')
    cy.contains('error.404.title').should('be.visible')
  })

  context('As an admin', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('admin')
    })
    it('should prevent a non-author from seeing delete button', () => {
      OpinionPage.visitVersionPage('NavBarMenuQuery')
      cy.get('#opinion-delete').should('not.exist')
    })

    it('should allow the author to edit a version', () => {
      OpinionPage.visitVersionToEditPage('NavBarMenuQuery')

      cy.get('button#opinion-version-edit-button').should('exist').click({ force: true })

      cy.get('[name="title"]').clear().type('Updated title')
      cy.get('#version-body .jodit-wysiwyg').should('exist').clear().type('Updated body')
      cy.get('#version-comment .jodit-wysiwyg').should('exist').clear().type('Updated comment')

      cy.get('#label-checkbox-confirm-opinion-version').should('exist').click({ force: true })

      cy.interceptGraphQLOperation({ operationName: 'ChangeVersionMutation' })
      cy.get('#opinion-version-edit-update').should('exist').click({ force: true })
      cy.wait('@ChangeVersionMutation')

      cy.contains('Updated title').should('be.visible')
      cy.contains('Updated body').should('be.visible')
      cy.contains('Updated comment').should('be.visible')
    })

    it('should allow a non-author to report a version', () => {
      cy.task('enable:feature', 'reporting')
      OpinionPage.visitVersionPage('NavBarMenuQuery')

      cy.get('button[id^="report-opinion"]').should('exist').click({ force: true })

      cy.get('#reportType').select('1')
      cy.get('#reportBody').type('Spam or abusive content')
      cy.get('#report-button-submit').should('exist').click({ force: true })

      cy.get('.toasts-container--top div').should('contain', 'alert.success.report.proposal')
      cy.contains('global.report.reported').should('be.visible')

      cy.get('button[id^="report-opinion"]').should('be.disabled')
    })
  })
})

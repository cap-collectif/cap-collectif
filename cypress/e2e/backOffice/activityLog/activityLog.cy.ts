import { ActivityLogPage } from '~e2e/pages'

describe('Admin activity log page', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
    ActivityLogPage.visitActivityLogPage()
  })

  it('displays admin activity log page with data', () => {
    cy.checkTableLength(6)
    cy.get('.cap-table__tbody .cap-table__tr')
      .eq(0)
      .within(() => {
        ActivityLogPage.checkRowCellContentByIndex(0, '01/07/2025')
        ActivityLogPage.checkRowCellContentByIndex(1, 'admin')
        ActivityLogPage.checkRowCellContentByIndex(1, 'admin@test.com')
        ActivityLogPage.checkRowCellContentByIndex(2, 'activity-log.action.delete')
        ActivityLogPage.checkRowCellContentByIndex(
          3,
          "l'étape Collecte des questions chez youpie du projet Questions/Responses",
        )
        ActivityLogPage.checkRowCellContentByIndex(4, '127.0.0.1')
      })
  })

  it('filters activity log with a search term', () => {
    ActivityLogPage.typeSearchTerm('question')
    cy.checkTableLength(3)
  })
  it('filters activity log with a start date', () => {
    cy.setCapInputDateTime(0, '2025-07-01T08:00')
    cy.checkTableLength(3)
  })
  it('filters activity log with an end date', () => {
    cy.setCapInputDateTime(1, '2025-07-01T08:00')
    cy.checkTableLength(3)
  })
  it('correctly resets filters', () => {
    ActivityLogPage.typeSearchTerm('hermione')
    cy.checkTableLength(0)
    cy.get('.cap-button')
      .contains('table.empty.reset-filters-and-search')
      .should('exist')
      .and('be.visible')
      .click({ force: true })
    cy.checkTableLength(6)
  })
})

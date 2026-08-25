describe('Project types back office', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })

  // This feature is not largely used, so we only cover the one action it exposes: editing a type's color
  it('edits a project type color', () => {
    const newColor = '#123456'

    cy.interceptGraphQLOperation({ operationName: 'ProjectTypesListQuery' })
    cy.visit('/admin-next/project-types')
    cy.wait('@ProjectTypesListQuery').its('response.statusCode').should('not.eq', 500)

    cy.contains('td', 'global.consultation')
      .closest('tr')
      .within(() => {
        cy.get('button[aria-label="global.edit"]').click()
      })

    cy.get('#color').filter(':visible').clear().type(newColor, { delay: 0 })

    cy.interceptGraphQLOperation({ operationName: 'UpdateProjectTypeMutation' })
    cy.contains('button', 'global.edit').filter(':visible').click()
    cy.wait('@UpdateProjectTypeMutation').its('response.statusCode').should('not.eq', 500)

    cy.contains('global.changes.saved').should('be.visible')

    cy.contains('td', 'global.consultation')
      .closest('tr')
      .within(() => {
        cy.contains(newColor).should('be.visible')
      })
  })
})

describe('Blog settings back office', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('views and edits blog settings as admin', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'BlogSettingsListQuery' })
    cy.visit('/admin-next/blog-settings')
    cy.wait('@BlogSettingsListQuery').its('response.statusCode').should('not.eq', 500)

    cy.contains('blog.pagination.size')
      .closest('tr')
      .within(() => {
        cy.contains('10')
        cy.get('button[aria-label="global.edit"]').click()
      })

    cy.get('#value').filter(':visible').clear().type('12', { delay: 0 })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.contains('blog.pagination.size').closest('tr').should('contain', '12')
  })
})

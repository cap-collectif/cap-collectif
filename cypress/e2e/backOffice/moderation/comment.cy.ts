describe('Comments moderation', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('should view comments moderation page and its content', () => {
    cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    cy.directLoginAs('admin')
    cy.visit('/admin/capco/app/comment/list')
    cy.wait('@AdminRightNavbarAppQuery').its('response.statusCode').should('eq', 200)
    cy.get('@AdminRightNavbarAppQuery').its('response.body.errors').should('not.exist')
    cy.get('a').contains('global.contenu').should('exist').and('be.visible')
    cy.get('table tbody tr').should('have.length.greaterThan', 23)
  })
})

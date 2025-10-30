export default new (class ContactPageBO {
  get cy() {
    return cy
  }

  visitContactPage() {
    cy.interceptGraphQLOperation({ operationName: 'ContactAdminPageAppQuery' })
    cy.visit('/admin/contact/list')
    cy.wait('@ContactAdminPageAppQuery', { timeout: 10000 }).its('response.statusCode').should('not.eq', 500)
  }

  saveChanges() {
    cy.scrollTo('bottom')
    cy.get('button').contains('global.save').click()
  }
  changesAreSaved() {
    cy.contains('global.saved', { timeout: 8000 }).should('exist')
  }
})()

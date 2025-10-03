export default new (class ActivityLogPage {
  get cy() {
    return cy
  }

  pathActivityLogList() {
    return 'admin-next/activity-log'
  }
  waitForActivityLogQuery() {
    cy.interceptGraphQLOperation({ operationName: 'ActivityLogPageQuery' })
    return this.cy.wait('@ActivityLogPageQuery', { timeout: 10000 })
  }
  visitActivityLogPage() {
    cy.visit(this.pathActivityLogList())
    return this.waitForActivityLogQuery
  }

  checkRowCellContentByIndex(index: number, content: string) {
    return cy.get('.cap-table__td').eq(index).should('exist').and('be.visible').and('contain', content)
  }

  typeSearchTerm(term: string) {
    cy.get('div.cap-search__input-container').type(term)
    this.waitForActivityLogQuery()
  }
})()

type ValidUrl = '/projects' | '/projects/archived'

export default new (class ProjectsPage {
  get cy() {
    return cy
  }

  openFilter() {
    this.cy.get('#project-button-filter').click()
  }

  applyFilter(category: string, item: string) {
    this.openFilter()
    this.cy.contains(category).click()
    this.cy.contains(item).click()
  }

  assertProjectsCardLength(expectedLength: number) {
    this.cy.get('#project-list > div > div > div').should('have.length', expectedLength)
  }

  clearFilter() {
    this.cy.get('.select__clear-zone').click()
  }

  visit(url: ValidUrl) {
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectsListQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectListFiltersContainerQuery' })
    this.cy.visit(url)
    this.cy.wait('@ProjectsListQuery')
    return this.cy.wait('@ProjectListFiltersContainerQuery')
  }
})()

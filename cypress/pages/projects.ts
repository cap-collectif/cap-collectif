type ValidUrl = '/projects' | '/projects?state=ARCHIVED'

export default new (class ProjectsPage {
  get cy() {
    return cy
  }

  openFilter() {
    this.cy.get('#project-button-filter').click()
  }

  applyModalFilter(filter: string) {
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectsListQuery' })
    this.openFilter()
    this.cy.get(filter).click({ force: true })
    this.cy.get('button#apply-project-filters-button').click()
    return this.cy.wait('@ProjectsListQuery')
  }

  searchByTitle(title: string) {
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectsListQuery' })
    this.cy.get('#search-in-project-list-by-title input').type(title)
    return this.cy.wait('@ProjectsListQuery')
  }

  assertProjectsCardLength(expectedLength: number) {
    this.cy.get('main#projects-page .cap-project-card').should('have.length', expectedLength)
  }

  selectTheme(theme: string) {
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectsListQuery' })
    this.cy.dsSelectSetOption('div#project-theme', theme)
    return cy.wait('@ProjectsListQuery')
  }

  getNthProject(nth: number) {
    return this.cy.get(`main#projects-page .cap-project-card:nth-child(${nth})`)
  }

  clearFilter() {
    this.cy.get('.select__clear-zone').click()
  }

  visit(url: ValidUrl) {
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectsListQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectListSectionFiltersQuery' })
    this.cy.visit(url)
    this.cy.wait('@ProjectsListQuery')
    return this.cy.wait('@ProjectListSectionFiltersQuery')
  }
})()

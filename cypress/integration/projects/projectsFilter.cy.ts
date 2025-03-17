import { ProjectsPage } from '~e2e/pages'

context('Projects', () => {
  describe('Projects page', () => {
    beforeEach(() => {
      ProjectsPage.visit('/projects')
    })
    it('should correctly filter by archived projects', () => {
      cy.interceptGraphQLOperation({ operationName: 'ProjectListViewRefetchQuery' })
      ProjectsPage.applyFilter('active-projects', 'archived-projects')
      cy.wait('@ProjectListViewRefetchQuery')
      ProjectsPage.assertProjectsCardLength(1)
    })
    it('should correctly filter by non archived projects', () => {
      ProjectsPage.assertProjectsCardLength(16)
      cy.contains('Projet Archivé').should('not.exist')
    })
    it('should correctly show all projects when archived projects filter is cleared', () => {
      cy.interceptGraphQLOperation({ operationName: 'ProjectListViewRefetchQuery' })
      ProjectsPage.openFilter()
      ProjectsPage.clearFilter()
      cy.wait('@ProjectListViewRefetchQuery')
      ProjectsPage.assertProjectsCardLength(16)
      cy.contains('Projet Archivé').should('exist')
    })
  })
  describe('Projects archived page', () => {
    beforeEach(() => {
      ProjectsPage.visit('/projects/archived')
    })
    it('archived projects filter should be set', () => {
      cy.contains('Projet Archivé').should('exist')
      ProjectsPage.assertProjectsCardLength(1)
    })
  })
})

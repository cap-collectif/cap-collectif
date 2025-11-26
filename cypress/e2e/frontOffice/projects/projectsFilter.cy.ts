import { ProjectsPage } from '~e2e/pages'

context('Projects', () => {
  describe('Projects page', () => {
    beforeEach(() => {
      ProjectsPage.visit('/projects')
    })
    it('should correctly filter by archived projects', () => {
      ProjectsPage.applyModalFilter('#state-ARCHIVED')
      ProjectsPage.assertProjectsCardLength(1)
    })
    it('should correctly filter by non archived projects', () => {
      ProjectsPage.assertProjectsCardLength(16)
      cy.contains('Projet Archivé').should('not.exist')
    })
    it('should correctly filter by title', () => {
      ProjectsPage.searchByTitle('food')
      cy.contains('Food project').should('exist')
      ProjectsPage.assertProjectsCardLength(1)
    })
    it('should not see private project', () => {
      cy.contains('Qui doit conquérir le monde ? | Visible par les admins seulement').should('not.exist')
    })
    it('should correctly filter by theme', () => {
      ProjectsPage.assertProjectsCardLength(16)
      ProjectsPage.selectTheme('Transport')
      ProjectsPage.assertProjectsCardLength(11)
      cy.contains('Projet vide').should('exist')
      cy.contains('Dépot avec selection vote budget').should('exist')
      cy.contains('Croissance, innovation, disruption').should('not.exist')
    })
    it('should display restricted project when correctly logged', () => {
      cy.directLoginAs('super_admin')
      ProjectsPage.visit('/projects')
      ProjectsPage.searchByTitle('custom')
      ProjectsPage.assertProjectsCardLength(1)
      cy.contains('Un avenir meilleur pour les nains de jardins (custom access)').should('exist')
    })
    it('should correctly filter by status', () => {
      ProjectsPage.applyModalFilter('#status-2') // ongoing
      ProjectsPage.assertProjectsCardLength(16)
      ProjectsPage.applyModalFilter('#status-3') // closed
      ProjectsPage.assertProjectsCardLength(6)
      ProjectsPage.applyModalFilter('#status-0') // future
      ProjectsPage.assertProjectsCardLength(1)
    })
    it('should correctly sort by contributions', () => {
      ProjectsPage.applyModalFilter('#orderBy-POPULAR')
      ProjectsPage.getNthProject(1).contains('Croissance, innovation, disruption')
      ProjectsPage.getNthProject(2).contains('Projet de loi Renseignement')
    })
    it('should correctly sort by contributions AND filter by theme at the same time', () => {
      ProjectsPage.selectTheme('Transport')
      ProjectsPage.applyModalFilter('#orderBy-POPULAR')
      ProjectsPage.assertProjectsCardLength(11)
      ProjectsPage.getNthProject(1).contains('Projet de loi Renseignement')
      ProjectsPage.getNthProject(7).contains('Projet vide')
      cy.contains('Croissance, innovation, disruption').should('not.exist')
    })
    it('should correctly sort by contributions AND filter by type at the same time', () => {
      ProjectsPage.applyModalFilter('#orderBy-POPULAR')
      ProjectsPage.applyModalFilter('#type-2')
      ProjectsPage.assertProjectsCardLength(8)
      ProjectsPage.getNthProject(1).contains('Projet de loi Renseignement')
      cy.contains('Croissance, innovation, disruption').should('not.exist')
    })
  })

  describe('Projects archived page', () => {
    beforeEach(() => {
      ProjectsPage.visit('/projects?state=ARCHIVED')
    })
    it('archived projects filter should be set', () => {
      cy.contains('Projet Archivé').should('exist')
      ProjectsPage.assertProjectsCardLength(1)
    })
  })
})

import { AdminProjectsPage } from '../pages'

describe('Admin projects', () => {
  beforeEach(() => {
    cy.login({
      email: 'theo@cap-collectif.com',
      password: 'toto',
    })
  })
  it('should allow a project admin to go to the back-office projects list page', () => {
    AdminProjectsPage.visit()
    cy.contains('Projet avec administrateur de projet').should('exist')
  })
  it('should redirect a project admin when going to the admin dashboard page', () => {
    cy.visit('/admin/dashboard')
    cy.url().should('not.contain', '/admin/dashboard')
    cy.url().should('contain', AdminProjectsPage.path)
  })
  it('should redirect a project admin when navigating to back office from the main menu', () => {
    cy.get('#navbar-username').click()
    cy.contains('global.administration').click()
    cy.url().should('not.contain', '/admin/dashboard')
    cy.url().should('contain', AdminProjectsPage.path)
  })
})

describe('Public Next routes smoke test', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('disable:feature', 'shield_mode')
    cy.task('disable:feature', 'captcha')
    cy.task('enable:feature', 'blog')
  })

  it('renders the contact page', () => {
    cy.request('/contact').its('status').should('eq', 200)
    cy.visit('/contact')
    cy.get('[id^="accordion-button"]', { timeout: 10000 }).should('exist')
  })

  it('renders the projects page', () => {
    cy.request('/projects').its('status').should('eq', 200)
    cy.visit('/projects')
    cy.get('.cap-project-card', { timeout: 10000 }).its('length').should('be.gte', 1)
  })

  it('renders the blog page', () => {
    cy.request('/blog').its('status').should('eq', 200)
    cy.visit('/blog')
    cy.get('.cap-post-card', { timeout: 10000 }).its('length').should('be.gte', 1)
  })

  it('renders a custom page', () => {
    cy.request('/pages/faq').its('status').should('eq', 200)
    cy.visit('/pages/faq')
    cy.contains('FAQ FR').should('exist')
  })

  it('renders the charter page', () => {
    cy.request('/pages/charte').its('status').should('eq', 200)
    cy.visit('/pages/charte')
    cy.get('#charter-page', { timeout: 10000 }).should('exist')
  })

  it('renders a project district page', () => {
    cy.request('/project-district/premier-quartier').its('status').should('eq', 200)
    cy.visit('/project-district/premier-quartier')
    cy.get('#district-page', { timeout: 10000 }).should('exist')
  })

  it('renders an organization profile page', () => {
    cy.request('/profile/organization/giec').its('status').should('eq', 200)
    cy.visit('/profile/organization/giec')
    cy.get('#organization-page', { timeout: 10000 }).should('exist')
  })
})

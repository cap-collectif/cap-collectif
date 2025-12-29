describe('Contact page', () => {
  const fillForm = (name: string, email: string, title: string, body: string) => {
    if (name) cy.get('input[name="name"]').type(name)
    if (email) cy.get('input[name="email"]').type(email)
    if (title) cy.get('input[name="title"]').type(title)
    if (body) cy.get('textarea[name="body"]').type(body)
  }

  before(() => {
    cy.task('disable:feature', 'captcha')
    cy.task('disable:feature', 'shield_mode')
  })
  beforeEach(() => {
    cy.task('db:restore')
    cy.visit('/contact')
    cy.get('[id^="accordion-button"]', { timeout: 10000 })
  })

  it('correctly sends a message via the first form', () => {
    cy.visit('/contact')
    cy.get('[id^="accordion-button"]')
    fillForm('Marie Lopez', 'enjoyphoenix@gmail.com', 'Partenariat', 'Lorem ipsum')
    cy.get('button[type="submit"]').click({ force: true })
    cy.get('.toasts-container--top div').should('contain', 'contact.email.sent_success')
  })
  it('cannot send a message via the first form with field errors', () => {
    cy.visit('/contact')
    cy.get('[id^="accordion-button"]')
    fillForm('', 'enjoyphoenixbadmail.com', '', '')
    cy.get('button[type="submit"]').click({ force: true })
    cy.get('div#email-error').should('contain', 'global.constraints.email.invalid')
    cy.get('div#title-error').should('contain', 'fill-field')
    cy.get('div#body-error').should('contain', 'fill-field')
  })
})

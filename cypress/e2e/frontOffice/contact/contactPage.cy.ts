describe('Contact page', () => {
  const fillForm = (name: string, email: string, title: string, body: string) => {
    if (name) cy.get('input[name="name"]').type(name)
    if (email) cy.get('input[name="email"]').type(email)
    if (title) cy.get('input[name="title"]').type(title)
    if (body) cy.get('textarea[name="body"]').type(body)
  }

  before(() => {
    cy.task('db:restore')
    cy.task('disable:feature', 'captcha')
    cy.task('disable:feature', 'shield_mode')
  })
  beforeEach(() => {
    cy.visit('/contact')
    cy.get('button#accordion-button-Q29udGFjdEZvcm06Y29udGFjdEZvcm0x', { timeout: 10000 })
  })

  it('User wants to send a message via the first form', () => {
    fillForm('Marie Lopez', 'enjoyphoenix@gmail.com', 'Partenariat', 'Lorem ipsum')
    cy.contains('global.send').click({ force: true })
    cy.get('.toasts-container--top div').should('contain', 'contact.email.sent_success')
  })
  it('User wants to send a message via the first form with wrong fields', () => {
    fillForm('', 'enjoyphoenixbadmail.com', '', '')
    cy.contains('global.send').click({ force: true })
    cy.get('div#email-error').should('contain', 'global.constraints.email.invalid')
    cy.get('div#title-error').should('contain', 'fill-field')
    cy.get('div#body-error').should('contain', 'fill-field')
  })
})

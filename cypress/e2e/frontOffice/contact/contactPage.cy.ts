describe('Contact page', () => {
  const disableFeatureForDev = (feature: string) =>
    cy.exec(`fab local.app.toggle-disable --toggle=${feature} --environment=dev`, {
      failOnNonZeroExit: true,
      log: false,
    })

  const getFirstContactForm = () => cy.get('form[id^="contact-form-"]').first()

  const fillForm = (name: string, email: string, title: string, body: string) => {
    getFirstContactForm().within(() => {
      if (name) cy.get('input[name="name"]').type(name)
      if (email) cy.get('input[name="email"]').type(email)
      if (title) cy.get('input[name="title"]').type(title)
      if (body) cy.get('textarea[name="body"]').type(body)
    })
  }

  beforeEach(() => {
    cy.task('db:restore')
    cy.task('disable:feature', 'captcha')
    cy.task('disable:feature', 'shield_mode')
    disableFeatureForDev('captcha')
    disableFeatureForDev('shield_mode')
    cy.visit('/contact')
    cy.get('[id^="accordion-button"]', { timeout: 10000 })
  })

  it('correctly sends a message via the first form', () => {
    cy.interceptGraphQLOperation({ operationName: 'SendContactFormMutation' })
    fillForm('Marie Lopez', 'enjoyphoenix@gmail.com', 'Partenariat', 'Lorem ipsum')
    getFirstContactForm().within(() => {
      cy.get('button[type="submit"]').click()
    })
    cy.wait('@SendContactFormMutation').its('response.statusCode').should('eq', 200)
    cy.get('@SendContactFormMutation').its('response.body.errors').should('be.undefined')
    cy.get('.toasts-container--top div').should('contain', 'contact.email.sent_success')
  })

  it('cannot send a message via the first form with field errors', () => {
    fillForm('', 'enjoyphoenixbadmail.com', '', '')
    getFirstContactForm().within(() => {
      cy.get('button[type="submit"]').click()
      cy.get('div#email-error').should('contain', 'global.constraints.email.invalid')
      cy.get('div#title-error').should('contain', 'fill-field')
      cy.get('div#body-error').should('contain', 'fill-field')
    })
  })
})

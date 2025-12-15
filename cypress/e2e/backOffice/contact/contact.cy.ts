import { ContactPageBO } from '~e2e/pages'

describe('Contact page logged as admin', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('updates contact page title', () => {
    cy.directLoginAs('admin')
    ContactPageBO.visitContactPage()

    cy.get('input[name="title"]').clear().type('Titre de la page de contact')
    ContactPageBO.saveChanges()
    ContactPageBO.changesAreSaved()
  })

  it('updates contact page advanced properties', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    ContactPageBO.visitContactPage()
    cy.get('.list-group-item').should('exist')

    cy.get('input[name="custom.metadescription"]').clear().type('Je suis la metadescription')
    cy.get('textarea[name="custom.customcode"]').clear().type('<script> console.log("Je suis le code perso")')
    ContactPageBO.saveChanges()

    cy.wait(1000) // cannot intercept the mutation reliably
    ContactPageBO.changesAreSaved()
  })

  it('creates a contact form', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    ContactPageBO.visitContactPage()
    cy.get('#openAddModalButton').should('exist').click()

    cy.get('input[id="CreateContactAdminForm-contact-title"]').clear().type('Contact Form 1')
    cy.get('div.form-group #CreateContactAdminForm-contact-body').clear().type('Some content')
    cy.get('input[id^="CreateContactAdminForm-"][type="email"]').clear().type('admin@test.com')
    cy.get('div.form-group #CreateContactAdminForm-confidentiality').clear().type('Confidentialité')

    cy.get('#CreateContactAdminForm-submit-create-contact').should('exist').click()
    cy.scrollTo('bottom')
    cy.get('.global-loading').should('not.exist')

    cy.get('.list-group-item').should('have.length.at.least', 4)
  })

  it('updates an existing contact form', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    ContactPageBO.visitContactPage()
    cy.get("[id^='UpdateContact-']").first().click()

    // update fields
    cy.get('input[id^=UpdateContactAdminForm-').first().clear().type('Je suis un titre MAJ')
    cy.get('input[id^="UpdateContactAdminForm-"][type="email"]').clear().type('adminMAJ@test.com')
    cy.get("[id^='UpdateContactAdminForm-']").first().click()
    cy.get('button[type="submit"]').contains('validate').should('exist').click()
    cy.wait(500)
    cy.get('.toasts-container--top div').should('exist')
  })

  it('deletes a contact form', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    ContactPageBO.visitContactPage()
    cy.get('div.list-group span.list-group-item').should('have.length', 3)
    cy.get('div.list-group').contains('Contact form 1').should('exist')
    cy.get("[id^='DeleteContact-']").contains('global.delete').first().click()
    cy.get('#delete-modal-button-delete').click()
    cy.get('div.list-group').contains('Contact form 1').should('not.exist')
    cy.get('div.list-group span.list-group-item').should('have.length', 2)
  })

  it('displays an error when title is empty', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    ContactPageBO.visitContactPage()
    cy.get('input[name="title"]').clear()
    cy.contains('fill-field').should('exist')
  })
})

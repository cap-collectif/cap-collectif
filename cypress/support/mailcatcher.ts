let currentMail: Cypress.MailcatcherMessage | null = null

Cypress.Commands.add('purgeEmails', () => {
  return cy.task('mailcatcher:purge')
})

Cypress.Commands.add('openMailTo', (email: string) => {
  return cy.task('mailcatcher:findByTo', email, { timeout: 10000 }).then(message => {
    if (!message) {
      throw new Error(`No email found for recipient: ${email}`)
    }
    currentMail = message as Cypress.MailcatcherMessage
    return cy.wrap(currentMail)
  })
})

Cypress.Commands.add('mailShouldContain', (text: string) => {
  if (!currentMail) {
    throw new Error('No email selected. Use cy.openMailTo() first.')
  }

  cy.task<string>('mailcatcher:getContent', currentMail.id).should('include', text)
})

Cypress.Commands.add('getMailCount', () => {
  return cy.task('mailcatcher:count')
})

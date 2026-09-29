describe('Newsletter Subscription Admin Page', () => {
  const visitPage = () => {
    cy.visit('/admin-next/newsletter-subscriptions', { failOnStatusCode: false })
  }

  const visitPageAsAdmin = () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'newsletterSubscriptions_Query' })
    visitPage()
    cy.wait('@newsletterSubscriptions_Query')
  }

  const rowFor = (email: string) => cy.contains('td', email).closest('tr')

  beforeEach(() => {
    cy.task('db:restore')
    cy.enableFeatureFlag('unstable__sonata_migration_to_admin_next')
  })

  it('redirects a non-admin account to 403 page', () => {
    cy.directLoginAs('project_owner')
    visitPage()
    cy.url().should('contain', '/admin-next/403')
    cy.contains('unauthorized-access').should('be.visible')
  })

  it('creates a newsletter subscription', () => {
    const email = `newsletter-${Date.now()}@cap-collectif.com`

    visitPageAsAdmin()
    cy.contains('button', 'admin.newsletter-subscriptions.create').click()
    cy.get('#email').filter(':visible').type(email, { delay: 0 })

    cy.interceptGraphQLOperation({ operationName: 'CreateNewsletterSubscriptionMutation' })
    cy.contains('button', 'global.save').filter(':visible').click()
    // GraphQL answers 200 even on failure, so assert on the payload rather than the HTTP status.
    cy.wait('@CreateNewsletterSubscriptionMutation')
      .its('response.body.data.createNewsletterSubscription.errorCode')
      .should('eq', null)

    visitPageAsAdmin()
    rowFor(email).within(() => {
      cy.contains('global.yes').should('be.visible')
    })
  })

  it('refuses an email already subscribed', () => {
    visitPageAsAdmin()
    cy.contains('button', 'admin.newsletter-subscriptions.create').click()
    cy.get('#email').filter(':visible').type('maxime.auriau@cap-collectif.com', { delay: 0 })

    cy.interceptGraphQLOperation({ operationName: 'CreateNewsletterSubscriptionMutation' })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.wait('@CreateNewsletterSubscriptionMutation')
      .its('response.body.data.createNewsletterSubscription.errorCode')
      .should('eq', 'EMAIL_ALREADY_USED')
    cy.contains('newsletter.already_subscribed').should('be.visible')
  })

  it('unsubscribes an email', () => {
    const email = 'maxime.auriau@cap-collectif.com'

    visitPageAsAdmin()
    rowFor(email).find('button[aria-label^="global.edit.title"]').click()
    cy.get('#email').filter(':visible').should('have.value', email)
    cy.get('.cap-switch__slider').click()

    cy.interceptGraphQLOperation({ operationName: 'UpdateNewsletterSubscriptionMutation' })
    cy.contains('button', 'global.save').filter(':visible').click()
    cy.wait('@UpdateNewsletterSubscriptionMutation')
      .its('response.body.data.updateNewsletterSubscription.errorCode')
      .should('eq', null)

    // Reload to confirm the change was actually persisted, not just an optimistic UI update.
    visitPageAsAdmin()
    rowFor(email).within(() => {
      cy.contains('global.no').should('be.visible')
    })
  })

  it('deletes a newsletter subscription', () => {
    const email = 'pierre.bellenger@cap-collectif.com'

    visitPageAsAdmin()
    rowFor(email).find('button[aria-label^="admin.newsletter-subscriptions.delete"]').click()
    cy.interceptGraphQLOperation({ operationName: 'DeleteNewsletterSubscriptionMutation' })
    cy.get('[data-cy="deletion-confirmation"]').click()
    cy.wait('@DeleteNewsletterSubscriptionMutation')
    cy.contains('td', email).should('not.exist')
  })
})

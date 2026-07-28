describe('User account', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  afterEach(() => {
    cy.task('disable:feature', 'members_list')
    cy.task('disable:feature', 'user_type')
    cy.task('disable:feature', 'registration')
    cy.task('disable:feature', 'profiles')
  })

  it('requires a user without a username to complete their profile', () => {
    cy.interceptGraphQLOperation({ operationName: 'UpdateUsernameMutation' })
    cy.directLoginAs('no_name')
    cy.visit('/')

    cy.get('#account__username').type('This is my name')
    cy.get('#confirm-username-form-submit').click()
    cy.wait('@UpdateUsernameMutation')
    cy.get('#navbar-username').should('contain', 'This is my name')
  })

  it('opens notification preferences from a valid email token', () => {
    cy.visit('/profile/notifications/user-unsubscribe-token')

    cy.url().should('include', '/profile/edit-profile')
    cy.get('#navbar-username').should('contain', 'user')
  })

  it('rejects an invalid notification token', () => {
    cy.visit('/profile/notifications/j35u15un70k3n7r4ff1que', { failOnStatusCode: false })

    cy.url().should('not.include', '/profile/edit-profile')
  })

  it('shows the members list when the feature is enabled', () => {
    cy.task('enable:feature', 'members_list')
    cy.task('enable:feature', 'user_type')
    cy.visit('/members')

    cy.get('.media--user-thumbnail').should('have.length', 16)
  })

  it('disables notifications from an email token', () => {
    cy.task('enable:feature', 'profiles')
    cy.directLoginAs('user')
    cy.visit('/profile/notifications/disable/user-unsubscribe-token')

    cy.url().should('include', '/profile/edit-profile')
    cy.contains('resetting.notifications.flash.success').should('be.visible')
    cy.get('a[href="#notifications"]').click()
    cy.get('#proposal-comment-mail').should('not.be.checked')

    cy.visit('/profile/edit-profile#notifications')
    cy.get('#proposal-comment-mail').should('not.be.checked')
  })

  it('resets a confirmed account password', () => {
    cy.task('enable:feature', 'registration')
    cy.task('enable:feature', 'profiles')
    cy.visit('/account/email_confirmation/check-my-email-token-with-more-characters-1')

    cy.url().should('include', '/resetting/reset/reset-my-password-token')
    cy.get('#reset-content-confirm').should('be.visible')
    cy.get('#password-form-new').type('a')
    cy.get('#password-form-confirmation').type('a')
    cy.contains('at-least-8-characters-one-digit-one-uppercase-one-lowercase').should('be.visible')

    cy.get('#password-form-new').clear().type('Toto91toto')
    cy.get('#password-form-confirmation').clear().type('Toto91toto')
    cy.get('#reset-content-confirm').click()

    cy.url().should('eq', Cypress.config('baseUrl') + '/')
    cy.get('#navbar-username').should('contain', 'admin_without_password')
    cy.contains('resetting.flash.success').should('be.visible')
  })
})

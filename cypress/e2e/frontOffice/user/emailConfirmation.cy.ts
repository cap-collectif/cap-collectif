describe('Email confirmation', () => {
  before(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'registration')
    cy.task('disable:feature', 'shield_mode')
  })
  it('should confirm email for not confirmed user', () => {
    cy.visit('/account/email_confirmation/azertyuiop')
    cy.get('#navbar-username').should('exist').and('be.visible').and('contain', 'user_not_confirmed')
    cy.get('#alert-email-not-confirmed').should('not.exist')
  })

  it('should update email for user with valid token', () => {
    cy.visit('/account/new_email_confirmation/check-my-new-email-token')
    cy.get('#navbar-username').should('exist').and('be.visible').and('contain', 'user_updating_email')
    cy.get('#alert-email-not-confirmed').should('not.exist')
  })
})

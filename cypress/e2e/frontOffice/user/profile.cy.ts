const profileUrl = '/profile/edit-profile'

const visitProfile = (tab = 'profile') => {
  cy.visit(`${profileUrl}#${tab}`)
  cy.get('#account-tabs').should('be.visible')
}

describe('User profile', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('user')
  })

  afterEach(() => {
    cy.task('disable:feature', 'profiles')
    cy.task('disable:feature', 'user_type')
  })

  it('updates the public profile when profiles and user types are enabled', () => {
    cy.task('enable:feature', 'profiles')
    cy.task('enable:feature', 'user_type')

    visitProfile()
    cy.get('#profile-form-username').clear().type('user3')
    cy.get('#profile-form-userType').select('VXNlclR5cGU6Mw==')
    cy.get('#public-data-form-biography').clear().type('This is a bio')
    cy.get('#profile-form-save').click()
    cy.contains('global.saved').should('be.visible')

    visitProfile()
    cy.get('#profile-form-username').should('have.value', 'user3')
    cy.get('#profile-form-userType').should('have.value', 'VXNlclR5cGU6Mw==')
    cy.get('#public-data-form-biography').should('have.value', 'This is a bio')
  })

  it('updates the username when profiles are disabled and validates a required username', () => {
    cy.task('disable:feature', 'profiles')

    visitProfile()
    cy.get('#profile-form-username').clear().blur()
    cy.contains('registration.constraints.username.min').should('be.visible')

    cy.get('#profile-form-username').type('user3')
    cy.get('#profile-form-save').click()
    cy.contains('global.saved').should('be.visible')

    visitProfile()
    cy.get('#profile-form-username').should('have.value', 'user3')
  })

  it('updates the public profile when user types are disabled', () => {
    cy.task('enable:feature', 'profiles')
    cy.task('disable:feature', 'user_type')

    visitProfile()
    cy.get('#profile-form-userType').should('not.exist')
    cy.get('#public-data-form-biography').clear().type('This is a bio')
    cy.get('#profile-form-save').click()
    cy.contains('global.saved').should('be.visible')
  })

  it('validates and updates the password', () => {
    visitProfile('password')

    cy.get('#password-form-current').type('incorrect-password')
    cy.get('#password-form-new').type('1234')
    cy.get('#password-form-confirmation').type('1234').blur()
    cy.contains('at-least-8-characters-one-uppercase-one-lowercase').should('be.visible')

    cy.get('#password-form-new').clear().type('Toto12345')
    cy.get('#password-form-confirmation').clear().type('Toto12345')
    cy.get('#profile-password-save').click()
    cy.contains('fos_user.password.not_current').should('be.visible')

    cy.get('#password-form-current').clear().type('user')
    cy.get('#profile-password-save').click()
    cy.get('#password-form-current').should('have.value', '')

    cy.get('#password-form-current').type('Toto12345')
    cy.get('#password-form-new').type('Toto123456')
    cy.get('#password-form-confirmation').type('Toto123456')
    cy.get('#profile-password-save').click()
    cy.get('#password-form-current').should('have.value', '')
  })

  it('keeps personal data changes after reopening the page', () => {
    visitProfile('personal-data')

    cy.get('#personal-data-form-firstname').clear().blur()
    cy.contains('fill-or-delete-field').should('be.visible')
    cy.get('#personal-data-form-save').should('be.disabled')

    cy.get('#personal-data-form-firstname').type('us').blur()
    cy.contains('two-characters-minimum-required').should('be.visible')
    cy.get('#personal-data-form-save').should('be.disabled')

    cy.get('#personal-data-form-firstname').clear().type('myNewFirstname')
    cy.get('#personal-data-form-save').click()
    cy.contains('global.saved').should('be.visible')

    visitProfile('personal-data')
    cy.get('#personal-data-form-firstname').should('have.value', 'myNewFirstname')
  })

  it('cancels personal-data deletion', () => {
    visitProfile('personal-data')

    cy.get('#personal-data-firstname').click()
    cy.get('#btn-cancel-delete-field').click()
    cy.get('#personal-data-form-firstname').should('not.have.value', '')
  })

  it('confirms personal-data deletion', () => {
    visitProfile('personal-data')

    cy.get('#personal-data-firstname').click()
    cy.get('#btn-confirm-delete-field').click()
    cy.get('#personal-data-form-save').click()
    cy.contains('global.saved').should('be.visible')

    visitProfile('personal-data')
    cy.get('#personal-data-form-firstname').should('not.exist')

    cy.get('#personal-data-address-address2-city-zipCode').click()
    cy.get('#btn-confirm-delete-field').click()
    cy.get('#personal-data-form-save').click()
    cy.contains('global.saved').should('be.visible')

    visitProfile('personal-data')
    cy.get('#personal-data-form-address').should('not.exist')
  })

  it('unfollows a proposal and keeps the change after reopening the page', () => {
    visitProfile('followings')

    cy.get('#profile-proposal-unfollow-button-UHJvcG9zYWw6cHJvcG9zYWw4').click()
    cy.get('#item-proposal-UHJvcG9zYWw6cHJvcG9zYWw4').should('not.exist')

    visitProfile('followings')
    cy.get('#item-proposal-UHJvcG9zYWw6cHJvcG9zYWw4').should('not.exist')
  })

  it('unfollows a project and keeps the change after reopening the page', () => {
    const projectId = 'UHJvamVjdDpwcm9qZWN0Ng=='

    visitProfile('followings')
    cy.interceptGraphQLOperation({ operationName: 'UnfollowProposalMutation' })

    cy.get(`[id="profile-project-unfollow-button-${projectId}"]`).click()
    cy.get(`[id="profile-project-collapse-${projectId}"]`).should('not.have.class', 'in')
    cy.wait('@UnfollowProposalMutation')

    visitProfile('followings')
    cy.get(`[id="profile-project-link-${projectId}"]`).should('not.be.visible')
  })

  it('unfollows every followed item', () => {
    visitProfile('followings')

    cy.get('#unfollow-all').click()
    cy.contains('no-following').should('be.visible')

    visitProfile('followings')
    cy.contains('no-following').should('be.visible')
  })

  it('opens followed proposals and projects', () => {
    visitProfile('followings')
    cy.get('#item-proposal-link-UHJvcG9zYWw6cHJvcG9zYWw4').click()
    cy.location('pathname').should('include', '/project/')

    cy.go('back')
    cy.get('[id="profile-project-link-UHJvamVjdDpwcm9qZWN0Ng=="]').click()
    cy.location('pathname').should('include', '/project/')
  })

  it('anonymizes the account after confirmation', () => {
    visitProfile('account')

    cy.get('#delete-account-profile-button').click()
    cy.get('#delete-account-soft').click()
    cy.get('#confirm-delete-form-submit').click()
    cy.location('pathname').should('eq', '/')
    cy.contains('account-and-contents-anonymized').should('be.visible')
  })
})

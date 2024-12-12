import { UserInvitePage } from '~e2e-pages/index'

describe('User invitation as admin', () => {
  before(() => {
    cy.task('db:restore')
  })

  it('views user invitation page when logged in as admin', () => {
    cy.interceptGraphQLOperation({ operationName: 'inviteQuery' })
    cy.directLoginAs('admin')
    UserInvitePage.visitInviteUser()
    return cy.wait('@inviteQuery', { timeout: 5000 }).then(req => {
      expect(req.response?.statusCode).not.eq(500)
    })
  })

  it('invites new users, and adds them to a group', () => {
    cy.interceptGraphQLOperation({ operationName: 'InviteUserMutation' })
    cy.interceptGraphQLOperation({ operationName: 'inviteQuery' })
    cy.directLoginAs('admin')
    UserInvitePage.visitInviteUser()
    cy.wait('@inviteQuery', { timeout: 5000 })
    UserInvitePage.getInviteButton().click()
    UserInvitePage.addEmailToInvite()
    UserInvitePage.getGoToRoleStepButton().click()
    UserInvitePage.selectGroup()
    UserInvitePage.getGoToConfirmationStepButton().click()
    cy.get('div').contains('"nbGroups":1').should('exist')
    UserInvitePage.getSendInvitationButton().click()
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.wait('@InviteUserMutation', { timeout: 5000 }).then(req => {
      expect(req.response?.body?.data?.inviteUsers?.newInvitations).to.have.length(1)
      expect(req.response?.statusCode).not.eq(500)
    })
    UserInvitePage.getConfirmationToast()
  })

  it('gets the correct results after uploading a .csv file', () => {
    cy.interceptGraphQLOperation({ operationName: 'inviteQuery' })
    cy.interceptGraphQLOperation({ operationName: 'UserInviteModalStepsChooseUsersQuery' })
    cy.directLoginAs('admin')
    UserInvitePage.visitInviteUser()
    cy.wait('@inviteQuery', { timeout: 5000 })
    UserInvitePage.openInvitationModal()
    UserInvitePage.addCsvFile()
    cy.wait('@UserInviteModalStepsChooseUsersQuery', { timeout: 5000 })
    UserInvitePage.checkResultBanners()
  })

  it('sends another invitation to users whose invitation expired', () => {
    cy.interceptGraphQLOperation({ operationName: 'inviteQuery' })
    cy.interceptGraphQLOperation({ operationName: 'RelaunchUserInvitationsMutation' })
    cy.directLoginAs('admin')
    UserInvitePage.visitInviteUser()
    cy.wait('@inviteQuery', { timeout: 5000 })
    UserInvitePage.getRelaunchButton().should('not.exist')

    UserInvitePage.getExpiredRows().should('have.length', 3)

    // users not previously relaunched
    UserInvitePage.selectExpiredAndNotRelaunchedRows()
    UserInvitePage.getRelaunchButton().click()
    UserInvitePage.checkRelaunchMessage('notRelaunched')
    UserInvitePage.getCancelButton().click()
    UserInvitePage.uncheckAllRows()

    // users already  relaunched
    UserInvitePage.selectExpiredAndRelaunchedRows()
    UserInvitePage.getRelaunchButton().click()
    UserInvitePage.checkRelaunchMessage('relaunched')
    UserInvitePage.getCancelButton().click()
    UserInvitePage.uncheckAllRows()

    // users both relaunched and not relaunched yet
    UserInvitePage.selectAllExpiredRows()
    UserInvitePage.getRelaunchButton().click()
    UserInvitePage.checkRelaunchMessage('both')
    UserInvitePage.getCancelButton().click()

    UserInvitePage.clickAllRowsCheckbox('check')
    UserInvitePage.getRelaunchButton().click()
    cy.get('table input[type="checkbox"]').each($checkbox => {
      cy.wrap($checkbox).should('be.checked')
    })
    cy.get('#allRows').should('be.checked')
    UserInvitePage.getRelaunchButton().should('not.have.attr', 'disabled')
    UserInvitePage.confirmRelaunch()
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.wait('@RelaunchUserInvitationsMutation', { timeout: 5000 }).then(req => {
      return expect(req.response?.statusCode).not.eq(500)
    })
    UserInvitePage.getExpiredRows().should('have.length', 0)
  })

  it('deletes invitations with quick action delete button', () => {
    cy.interceptGraphQLOperation({ operationName: 'inviteQuery' })
    cy.interceptGraphQLOperation({ operationName: 'CancelUserInvitationsMutation' })
    cy.directLoginAs('admin')
    UserInvitePage.visitInviteUser()
    cy.wait('@inviteQuery', { timeout: 5000 })
    UserInvitePage.getInvitationRows().should('have.length', 13)
    UserInvitePage.getQuickActionDeleteButton().click()
    cy.wait('@CancelUserInvitationsMutation', { timeout: 5000 })
    UserInvitePage.getInvitationRows().should('have.length', 12)
  })

  it('deletes invitations by checking boxes and clicking the delete button', () => {
    cy.interceptGraphQLOperation({ operationName: 'inviteQuery' })
    cy.interceptGraphQLOperation({ operationName: 'CancelUserInvitationsMutation' })
    cy.directLoginAs('admin')
    UserInvitePage.visitInviteUser()
    UserInvitePage.getDeleteButton().should('not.exist')
    UserInvitePage.clickAllRowsCheckbox('check')
    UserInvitePage.getInvitationRows().should('have.length', 12)
    UserInvitePage.getDeleteButton().should('exist').click()
    UserInvitePage.confirmDelete()
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.wait('@CancelUserInvitationsMutation', { timeout: 5000 }).then(req => {
      return expect(req.response?.statusCode).not.eq(500)
    })
    UserInvitePage.getInvitationRows().should('have.length', 1)
  })
})

describe('User invitation as super-admin', () => {
  before(() => {
    cy.task('db:restore')
  })

  it('views user invitation page when logged in as super_admin', () => {
    cy.interceptGraphQLOperation({ operationName: 'inviteQuery' })
    cy.directLoginAs('super_admin')
    UserInvitePage.visitInviteUser()
    return cy.wait('@inviteQuery', { timeout: 5000 }).then(req => {
      expect(req.response?.statusCode).not.eq(500)
    })
  })
})

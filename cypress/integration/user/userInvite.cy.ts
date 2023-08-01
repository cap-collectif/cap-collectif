import { UserInvitePage } from "~e2e-pages/index";

describe('User invitation as admin and super-admin', () => {

  beforeEach(() => {
     cy.task('db:restore')
  })

  it('Logged in super admin wants to go to the user invite page', () => {
    cy.directLoginAs('super_admin')
    cy.interceptGraphQLOperation({operationName: 'UserInviteAdminPageQuery'}).as('UserInviteAdminPageQuery')
    UserInvitePage.visitInviteUser()
    cy.wait('@UserInviteAdminPageQuery').then((req) => {
        expect(req.response?.statusCode).not.eq(500)
    })
  })

  it('Logged in admin wants to go to the user invite page', () => {
    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({operationName: 'UserInviteAdminPageQuery'}).as('UserInviteAdminPageQuery')
    UserInvitePage.visitInviteUser()
    cy.wait('@UserInviteAdminPageQuery').then((req) => {
        expect(req.response?.statusCode).not.eq(500)
    })
  })
})
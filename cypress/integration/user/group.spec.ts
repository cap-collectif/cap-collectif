import { AdminGroupPage } from '~e2e-pages/index'

describe('User Admin', () => {
  describe('User group', () => {
    beforeEach(() => {
      cy.directLoginAs('admin')
    })
    it('Logged in super admin wants to edit a user profile', () => {
      AdminGroupPage.visit()
      AdminGroupPage.clickButtonAddGroup()
      cy.contains('group.create.title').should('exist')
    })
  })
})

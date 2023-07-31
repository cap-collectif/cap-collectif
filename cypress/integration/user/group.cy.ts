import { AdminGroupPage } from '~e2e-pages/index'
  
  describe('User group', () => {
    beforeEach(() => {
      cy.directLoginAs('admin')
    })
    it('Logged in admin wants to create a group', () => {
      AdminGroupPage.visit()
      AdminGroupPage.clickButtonAddGroup()
      cy.contains('group.create.title').should('exist')
    })
  })
import { AdminGroupsPage } from 'cypress/pages/index'

describe('Group deletion from the users groups page', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })

  it('deletes a group from the groups list', () => {
    cy.interceptGraphQLOperation({ operationName: 'DeleteGroupMutation' })
    AdminGroupsPage.visitGroupsList()
    cy.checkTableLength(8)
    cy.get('.cap-table__tbody .cap-table__tr')
      .eq(1)
      .within(() => {
        AdminGroupsPage.getRowCellByColumnIndex(0).should('contain', 'Agent de la ville')
        AdminGroupsPage.getRowCellByColumnIndex(3)
          .find('button')
          .should('have.attr', 'aria-label', 'global.delete')
          .click()
      })
    cy.wait(300) // modal appearance animation time
    AdminGroupsPage.getConfirmGroupDeletionButton().click()
    cy.wait('@DeleteGroupMutation', { timeout: 10000 })
    AdminGroupsPage.checkToast('admin.group-deletion-success')
    cy.get('.cap-table__tbody').should('not.contain', 'Agent de la ville')
    cy.checkTableLength(7)
  })

  it('deletes a group from the edit group modal', () => {
    cy.interceptGraphQLOperation({ operationName: 'DeleteGroupMutation' })
    AdminGroupsPage.visitGroupsList()
    AdminGroupsPage.openEditModal()
    AdminGroupsPage.getDeleteButtonFromEditModal().click()
    AdminGroupsPage.getConfirmGroupDeletionButton().click()
    cy.wait('@DeleteGroupMutation', { timeout: 10000 })
    AdminGroupsPage.getToast().contains('admin.group-deletion-success').should('exist')
    cy.checkTableLength(7)
    cy.get('admin.users.edit-group').should('not.exist')
    cy.get('.cap-table__tbody').should('not.contain', 'Utilisateurs')
  })
})

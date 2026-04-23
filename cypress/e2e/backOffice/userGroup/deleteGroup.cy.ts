import { AdminGroupsPage } from 'cypress/pages/index'

describe('Group deletion from the users groups page', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })

  it('deletes a group from the groups list', () => {
    cy.interceptGraphQLOperation({ operationName: 'DeleteGroupMutation' })
    AdminGroupsPage.visitGroupsList()
    cy.checkTableLength(9)
    cy.contains('.cap-table__tbody .cap-table__tr .cap-table__td', 'Comité de suvi')
      .parents('.cap-table__tr')
      .within(() => {
        cy.get('.cap-table__td').eq(0).should('contain', 'Comité de suvi')
        cy.get('.cap-table__td').eq(3).find('button').should('have.attr', 'aria-label', 'global.delete').click()
      })
    cy.wait(300) // modal appearance animation time
    AdminGroupsPage.getConfirmGroupDeletionButton().click()
    cy.wait('@DeleteGroupMutation')
    AdminGroupsPage.checkToast('admin.group-deletion-success')
    cy.get('.cap-table__tbody').should('not.contain', 'Comité de suvi')
    cy.checkTableLength(8)
  })

  it('deletes a group from the edit group modal', () => {
    cy.interceptGraphQLOperation({ operationName: 'DeleteGroupMutation' })
    AdminGroupsPage.visitGroupsList()
    AdminGroupsPage.openEditModal()
    AdminGroupsPage.getDeleteButtonFromEditModal().click()
    AdminGroupsPage.getConfirmGroupDeletionButton().click()
    cy.wait('@DeleteGroupMutation')
    AdminGroupsPage.getToast().contains('admin.group-deletion-success').should('exist')
    cy.checkTableLength(8)
    cy.get('admin.users.edit-group').should('not.exist')
    cy.get('.cap-table__tbody').should('not.contain', 'Utilisateurs')
  })

  it('does not delete a group when it is the last restricted viewer group of a custom project', () => {
    cy.interceptGraphQLOperation({ operationName: 'DeleteGroupMutation' })
    AdminGroupsPage.visitGroupsList()
    cy.checkTableLength(9)
    cy.get('.cap-table__tbody .cap-table__tr')
      .eq(1)
      .within(() => {
        AdminGroupsPage.getRowCellByColumnIndex(0).should('contain', 'Agent de la ville')
        AdminGroupsPage.getRowCellByColumnIndex(3)
          .find('button')
          .should('have.attr', 'aria-label', 'global.delete')
          .click()
      })
    cy.wait(300)
    AdminGroupsPage.getConfirmGroupDeletionButton().click()
    cy.wait('@DeleteGroupMutation')
    AdminGroupsPage.checkToast('admin.group.delete.last-restricted-viewer-group')
    cy.checkTableLength(9)
    cy.get('.cap-table__tbody').should('contain', 'Agent de la ville')
    AdminGroupsPage.findModal().should('exist').and('be.visible')
  })
})

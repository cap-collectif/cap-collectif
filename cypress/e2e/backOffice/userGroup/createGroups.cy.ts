import { AdminGroupsPage } from 'cypress/pages/index'

describe('Create a new group and add members to it', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })

  it('creates a group', () => {
    cy.interceptGraphQLOperation({ operationName: 'CreateGroupMutation' })
    AdminGroupsPage.visitGroupsList()
    cy.checkTableLength(9)
    AdminGroupsPage.getOpenCreateGroupModalButton().click()
    cy.wait(300) // modal appearance animation time
    AdminGroupsPage.findModal().should('exist').and('be.visible').and('contain', 'information')
    AdminGroupsPage.fillInGroupName()
    AdminGroupsPage.fillInGroupDescription()
    AdminGroupsPage.getNextStepButton().click()
    AdminGroupsPage.findModal()
      .should('exist')
      .and('be.visible')
      .and('not.contain', 'information')
      .and('contain', 'group-admin-add-members')
    AdminGroupsPage.addMembersViaInputText()
    AdminGroupsPage.addWrongFormatCsv()
    AdminGroupsPage.addMembersViaUploader()
    AdminGroupsPage.getCreateGroupButton().click()
    AdminGroupsPage.getToast().find('div').find('p').invoke('text').should('contain', 'admin.group-create-success')
    cy.get('.cap-table__tbody .cap-table__tr')
      .eq(0)
      .within(() => {
        AdminGroupsPage.getRowCellByColumnIndex(0).should('contain', 'Développeuses back-end')
        AdminGroupsPage.getRowCellByColumnIndex(1).should('contain', 'Meufs fan de PHP')
        AdminGroupsPage.getRowCellByColumnIndex(2).should('contain', '2')
      })
    cy.checkTableLength(10)
    AdminGroupsPage.findModal().should('not.exist')
  })
})

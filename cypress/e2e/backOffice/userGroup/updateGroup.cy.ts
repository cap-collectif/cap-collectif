import { AdminGroupsPage } from 'cypress/pages/index'

describe("Update a group's info and members", () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })

  it('should edit the group and display updated information', () => {
    cy.interceptGraphQLOperation({ operationName: 'UpdateGroupMutation' })
    AdminGroupsPage.visitGroupsList()
    AdminGroupsPage.openEditModal()

    // delete a member
    AdminGroupsPage.getMemberCard().should('have.length', 50).and('contain', 'sfavot')
    AdminGroupsPage.getMemberCard()
      .first()
      .find('.cap-buttonQuickAction')
      // workaround to make the button visible
      // to this day, cypress does not have a built-in way to trigger hover events
      .invoke('css', 'visibility', 'visible')
    cy.get('.cap-abstract-card .cap-buttonQuickAction').first().click({ force: true })
    AdminGroupsPage.getMemberCard().first().find('.cap-buttonQuickAction').click({ force: true })
    AdminGroupsPage.getMemberCard().first().should('not.contain', 'sfavot')

    // go to settings tab and make changes
    AdminGroupsPage.getModalTab('params').click()
    AdminGroupsPage.getGroupNameInput().should('have.value', 'Utilisateurs')
    AdminGroupsPage.getGroupDescriptionInput().should('have.value', 'Lorem ipsum dolor sit amet sapien estiam')
    AdminGroupsPage.getGroupNameInput().clear().type('Utilisatrices')
    AdminGroupsPage.getGroupDescriptionInput().clear().type('Lorem blabla')
    AdminGroupsPage.getAmountOfMembers(2).should('contain', '129')

    // go back to members tab and save changes
    AdminGroupsPage.getModalTab('members').click()
    AdminGroupsPage.getSaveButton().click()
    cy.wait('@UpdateGroupMutation')
    AdminGroupsPage.findEditGroupModal().should('not.exist')

    // check that updates are applied
    AdminGroupsPage.findGroupTitle(2, false, 'Utilisatrices')
    AdminGroupsPage.getGroupDescription(2).should('contain', 'Lorem blabla')
    // todo: fixme after mutations are merged and behavior is as expected
    // AdminGroupsPage.getAmountOfMembers(2).should('contain', '128')
  })

  it('should add members via input and csv import', () => {
    cy.interceptGraphQLOperation({ operationName: 'AddUsersToGroupFromEmailMutation' })
    AdminGroupsPage.visitGroupsList()
    AdminGroupsPage.openEditModal()
    AdminGroupsPage.addMembersViaSelect()
    AdminGroupsPage.importCsvFromEditModal()
    AdminGroupsPage.getSaveButton().click()
    cy.wait('@AddUsersToGroupFromEmailMutation')
    AdminGroupsPage.findEditGroupModal().should('not.exist')
    // todo: fixme after mutations are merged and behavior is as expected
    // AdminGroupsPage.getAmountOfMembers(2).should('contain', '130')
    AdminGroupsPage.checkToast('admin.update.successful')
  })

  it('should display an error if group title is empty and discard changes on cancel', () => {
    AdminGroupsPage.visitGroupsList()
    AdminGroupsPage.openEditModal()
    AdminGroupsPage.getModalTab('params').click()
    AdminGroupsPage.getGroupNameInput().clear()
    AdminGroupsPage.getSaveButton().click()
    cy.get('.cap-form-error-message').invoke('text').should('contain', 'fill-field')
    AdminGroupsPage.getCancelButton().click()
    AdminGroupsPage.findEditGroupModal().should('not.exist')
    // check that the group title is still the same
    AdminGroupsPage.findGroupTitle(2, false, 'Utilisateurs')
  })
})

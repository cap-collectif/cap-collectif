export default new (class AdminUserGroupsListPage {
  get cy() {
    return cy
  }

  pathGroupsList() {
    return 'admin-next/groups'
  }
  visitGroupsList() {
    this.cy.interceptGraphQLOperation({ operationName: 'groups_Query' })
    this.cy.visit(this.pathGroupsList())
    return this.cy.wait('@groups_Query', { timeout: 10000 })
  }
  findModal() {
    return this.cy.get('.cap-modal')
  }
  findEditGroupModal() {
    return this.cy.get('.edit-group-modal')
  }
  getRowCellByColumnIndex(columnIndex: number) {
    return this.cy.get('.cap-table__td').eq(columnIndex)
  }
  addGroup() {
    return this.cy.get('#create-group-btn').click()
  }
  getOpenCreateGroupModalButton() {
    return this.cy.get('button').contains('users.create-group')
  }
  getGroupNameInput() {
    return this.cy.get('div .cap-form-control').eq(0).find('input')
  }
  fillInGroupName() {
    return this.getGroupNameInput().click().type('Développeuses back-end')
  }
  getGroupDescriptionInput() {
    return this.cy.get('div .cap-form-control').eq(1).find('textarea')
  }
  fillInGroupDescription() {
    return this.getGroupDescriptionInput().click().type('Meufs fan de PHP')
  }
  addMembersViaSelect() {
    return this.cy.get('div .cap-form-control').eq(0).click().get('.cap-async-select__option').first().click()
  }
  addMembersViaInputText() {
    return this.cy.get('div .cap-form-control').eq(0).find('input').click().type('myriam@cap-collectif.com')
  }
  importCsvFromEditModal() {
    this.cy.get('button').contains('global.import-via-csv').click()
    this.addMembersViaUploader()
    this.cy.get('button').contains('group-admin-add-members').click()
  }
  addCsvFile(format: 'correct' | 'wrong-format') {
    if (format === 'correct') {
      return this.cy.get('input[type="file"]').selectFile('fixtures/emails.csv', { force: true })
    }
    if (format === 'wrong-format') {
      return this.cy.get('input[type="file"]').selectFile('fixtures/file-wrong-format.csv', { force: true })
    }
  }
  addWrongFormatCsv() {
    this.addCsvFile('wrong-format')
    this.checkResultBanners('wrong-format')
  }
  addMembersViaUploader() {
    this.addCsvFile('correct')
    this.checkResultBanners('correct')
  }
  checkResultBanners(fileChosen: 'correct' | 'wrong-format') {
    if (fileChosen === 'correct') {
      return this.cy
        .get('.import-results')
        .first()
        .parent()
        .should('not.contain', 'import.users-already-registered')
        .and('not.contain', 'invitations.already-used-emails')
        .and('contain', 'valid-users-for-import')
        .and('contain', 'csv-import.duplicate-lines')
        .and('contain', 'invitation.csv-bad-lines-error.title')
        .and('not.contain', 'file-not-imported')
        .and('not.contain', 'invalid-data-model-banner')
    }
    if (fileChosen === 'wrong-format') {
      return this.cy
        .get('.import-results')
        .first()
        .parent()
        .should('not.contain', 'import.users-already-registered')
        .and('not.contain', 'invitations.already-used-emails')
        .and('not.contain', 'valid-users-for-import')
        .and('not.contain', 'csv-import.duplicate-lines')
        .and('not.contain', 'invitation.csv-bad-lines-error.title')
        .and('contain', 'file-not-imported')
        .and('not.contain', 'invalid-data-model-banner')
    }
  }
  getNextStepButton() {
    return this.cy.get('button').contains('global.next')
  }
  getGroupDescription(index: number) {
    return this.cy
      .get('.cap-table__tbody .cap-table__tr')
      .eq(index)
      .within(() => {
        cy.get('.cap-table__td').eq(1)
      })
  }
  getAmountOfMembers(index: number) {
    return this.cy
      .get('.cap-table__tbody .cap-table__tr')
      .eq(index)
      .within(() => {
        cy.get('.cap-table__td').eq(2)
      })
  }
  findGroupTitle(index: number, open: boolean, value: string) {
    if (open) {
      this.cy
        .get('.cap-table__tbody .cap-table__tr')
        .eq(index)
        .within(() => {
          cy.get('.cap-table__td').should('contain', value)
          cy.get('.cap-table__td').eq(0).click() // click the group title to open edit modal
          cy.wait(300) // modal appearance animation time
        })
      return this.cy.get('.cap-modal').contains('admin.users.edit-group').should('exist').and('be.visible')
    } else {
      return this.cy
        .get('.cap-table__tbody .cap-table__tr')
        .eq(index)
        .within(() => {
          cy.get('.cap-table__td').should('contain', value)
          cy.get('.cap-table__td').eq(0)
        })
    }
  }
  openEditModal() {
    return this.findGroupTitle(2, true, 'Utilisateurs')
  }
  getModalTab(tabName: 'members' | 'params') {
    return this.cy.get('.cap-modal').find(`ul ${tabName === 'members' ? '#members' : '#settings'}`)
  }
  getCreateGroupButton() {
    return this.cy.get('button').should('exist').and('be.visible').contains('users.group-create')
  }
  getDeleteButtonFromEditModal() {
    return this.cy.get('.cap-modal').should('exist').and('be.visible').find('button').contains('global.delete')
  }
  getConfirmGroupDeletionButton() {
    return this.cy
      .get('.cap-modal')
      .should('exist')
      .and('be.visible')
      .find('button')
      .contains('global.permanently-remove')
  }
  getSaveButton() {
    return this.cy.get('button').contains('global.save')
  }
  getCancelButton() {
    return this.cy.get('button').contains('global.cancel')
  }
  getMemberCard() {
    return this.cy.get('.cap-card')
  }
  getToast() {
    return this.cy.get('.cap-toast', { timeout: 5000 }).should('exist').and('be.visible')
  }
  checkToast(label: string) {
    return this.getToast().contains(label).should('exist')
  }
})()

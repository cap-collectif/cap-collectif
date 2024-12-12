export default new (class UserInvitePage {
  get cy() {
    return cy
  }

  pathInviteUser() {
    return `admin-next/invite`
  }
  visitInviteUser() {
    return this.cy.visit(this.pathInviteUser())
  }
  clickAllRowsCheckbox(action: 'check' | 'uncheck') {
    return action === 'check' ? this.cy.get('#allRows').check() : this.cy.get('#allRows').uncheck()
  }
  getRelaunchButton() {
    return this.cy.get('button').contains('invitations.relaunch')
  }

  uncheckAllRows() {
    this.clickAllRowsCheckbox('check')
    this.clickAllRowsCheckbox('uncheck')
  }

  checkRows(condition: any) {
    return this.cy.get('tr').each($row => {
      if (condition($row)) {
        cy.wrap($row).find('input[type="checkbox"]').check()
      }
    })
  }

  selectAllExpiredRows() {
    return this.checkRows(($row: any) => $row.find('div[title="global.expired.feminine"]').length > 0)
  }

  selectExpiredAndNotRelaunchedRows() {
    return this.checkRows(($row: any) => {
      const hasExpiredText = $row.find('div[title="global.expired.feminine"]').length > 0
      const hasWasRemindedText = $row.text().includes('wasreminded')
      return hasExpiredText && !hasWasRemindedText
    })
  }

  selectExpiredAndRelaunchedRows() {
    return this.checkRows(($row: any) => $row.text().includes('wasreminded'))
  }

  checkRelaunchMessage(wasRelaunched: 'relaunched' | 'notRelaunched' | 'both') {
    return this.cy
      .get('.cap-modal')
      .should(
        'contain',
        wasRelaunched === 'relaunched'
          ? 'invitations.relaunch.already-relaunched {"count":1}'
          : wasRelaunched === 'notRelaunched'
          ? 'invitations.relaunched.none-relaunched {"count":2}'
          : 'invitations.relaunch.include {"relaunchedInvitations":1}',
      )
  }

  getDeleteButton() {
    return this.cy.get('button').contains('global.remove')
  }
  getCancelButton() {
    return this.cy.get('button').contains('global.cancel')
  }
  getQuickActionDeleteButton() {
    return this.cy.get('[aria-label="global.delete"].cap-buttonQuickAction').first()
  }
  getInviteButton() {
    return this.cy.get('button').contains('organization.invite')
  }
  openInvitationModal() {
    this.getInviteButton().click()
  }
  addCsvFile() {
    return this.cy.get('input[type="file"]').selectFile('fixtures/emails.csv', { force: true })
  }
  checkResultBanners() {
    return this.cy
      .get('.import-results')
      .first()
      .parent()
      .should('contain', 'import.users-already-registered')
      .and('contain', 'invitations.already-used-emails')
      .and('contain', 'valid-users-for-import')
      .and('contain', 'csv-import.duplicate-lines')
      .and('contain', 'invitation.csv-bad-lines-error.title')
      .and('not.contain', 'file-not-imported')
      .and('not.contain', 'invalid-data-model-banner')
  }
  confirmDelete() {
    return this.cy.get('button').contains('global.delete').click()
  }
  confirmRelaunch() {
    return this.cy.get('button').contains('global.confirm').click()
  }
  getCancelledInvitations() {
    return this.cy.get
  }
  getInvitationRows() {
    return this.cy.get('tr')
  }
  getExpiredRows() {
    return this.cy.get('div[title="global.expired.feminine"]')
  }
  addEmailToInvite() {
    return this.cy.get('#inputEmails').click().type('future@admin.com')
  }
  selectAdminRole() {
    return this.cy.get('#role_choice-ROLE_ADMIN').check()
  }
  getGoToRoleStepButton() {
    return this.cy.get('button').contains('setup-invitation')
  }
  getGoToConfirmationStepButton() {
    return this.cy.get('button').contains('organization.invite.verify-before-sending')
  }
  selectGroup() {
    this.cy.get('.cap-select__control').click()
    this.cy.get('.cap-select__option').first().click()
    this.cy.get('.cap-select__single-value').should('not.be.empty')
  }
  getSendInvitationButton() {
    return this.cy.get('button').contains('send-invitation')
  }
  getConfirmationToast() {
    return this.cy.get('div[aria-roledescription="status"]').contains('invite-sent {"nbInvites":1}')
  }
})()

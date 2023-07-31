import { AdminUserListPage, AdminUserPage } from "~e2e-pages/index"

context('Check user profile as admin and super-admin', () => {

  describe('User edit profile as super-admin profile account', () => {

    beforeEach(() => {
      cy.task('db:restore')
      cy.task('enable:feature', 'profiles')
      cy.directLoginAs('super_admin')
      AdminUserPage.visitProfile('userMaxime')
    })

    it('Logged in super admin wants to edit a user profile title', () => {
        
        const biography = "Le terme “zèbre” a été introduit par Jeanne Siaud-Facchin dans son ouvrage Trop intelligent pour être heureux ? L'adulte surdoué. Il désigne aussi bien l'enfant surdoué que l'adulte surdoué. Extraits des pages 20 à 23 de l'ouvrage : "
        cy.interceptGraphQLOperation({operationName: 'UpdateProfilePersonalDataMutation'})

        AdminUserPage.userProfileTitle()
        cy.contains('mauriau').should('be.visible')
        AdminUserPage.fillNeighborhood('Sur ma chaise')
        AdminUserPage.fillBiography(biography)
        AdminUserPage.saveProfileTitle()
        AdminUserPage.notifSave()
        cy.reload()

        AdminUserPage.userProfileData()
        AdminUserPage.fillCity('Issou')
        AdminUserPage.saveProfileData()
        AdminUserPage.notifSave()
        
        AdminUserPage.userProfilePassword()
        cy.contains('global.password').should('exist')
        AdminUserPage.currentPwdShouldBeDisabled()
        AdminUserPage.newPwdShouldBeDisabled()
    })

    it('Logged in super admin wants delete a user', () => {
        AdminUserPage.openDeleteProfileAccount()
        cy.contains('account-delete-confirmation').should('exist')
        AdminUserPage.deleteAccountAndContents()
        AdminUserPage.confirmDeleteAccount()
        cy.url().should('eq', (Cypress.config().baseUrl+'/'+AdminUserListPage.pathUserList()))
        cy.contains('deleted-user').should('be.visible')
    })

    it('Logged in super admin wants to create a user', () => {

        const usernameMinLength = 'a'
        const userEmailNotCorrect = 'qsdqsdqsdsqdqsdqs' 
        const username = 'Toto'
        const email = 'blague.toto@gmail.com'
        const pwd = 'toTo1234?azzd'

        AdminUserListPage.visitUserList()
        AdminUserListPage.addUser()
        cy.contains('add-a-user').should('be.visible')
        AdminUserListPage.fillUsername(usernameMinLength)
        cy.contains('registration.constraints.username.min').should('be.visible')
        AdminUserListPage.fillEmail(userEmailNotCorrect)
        cy.contains('global.constraints.email.invalid').should('be.visible')
        AdminUserListPage.clearUsername()
        AdminUserListPage.clearEmail()
        AdminUserListPage.fillUsername(username)
        AdminUserListPage.username.should('have.value', username)
        AdminUserListPage.fillEmail(email)
        AdminUserListPage.email.should('have.value', email)
        AdminUserListPage.fillPassword(pwd)
        AdminUserListPage.clickVip()
        AdminUserListPage.clickRoleAdmin()
        AdminUserListPage.clickRoleUser()
        cy.contains('global.invalid.form').should('not.exist')
        AdminUserListPage.confirmUserCreate()
        cy.contains('global.invalid.form').should('not.exist')
    })

  })

  describe('User edit profile as Admin profile account', () => {

    beforeEach(() => {
        cy.task('db:restore')
        cy.task('enable:feature', 'profiles')
        cy.directLoginAs('admin')
      })

    it('Logged in admin wants to edit a user profile account', () => {
        AdminUserPage.visitProfile('userMaxime')
        AdminUserPage.vipBeChecked()
        AdminUserPage.labelEnabledBeChecked()
        AdminUserPage.labelLockedNotBeChecked()
        AdminUserPage.roleUserBeChecked()
        AdminUserPage.roleSuperAdminShouldNotExist()
        AdminUserPage.saveAccountButtonBeDisabled()
        AdminUserPage.newsletterBeChecked()
        AdminUserPage.clickFormLabelLocked()
        AdminUserPage.saveAccountButtonNotDisabled()
        AdminUserPage.saveProfileAccountClicked()
        AdminUserPage.notifSave()

        AdminUserPage.visitProfile('userAdmin')
        AdminUserPage.userProfilePassword()
        AdminUserPage.currentPassword.should('be.visible')
        AdminUserPage.fillCurrentPassword('admin')
        AdminUserPage.fillNewPassword('a')
        cy.contains('at-least-8-characters-one-digit-one-uppercase-one-lowercase').should('be.visible')
        AdminUserPage.clearNewPassword()
        AdminUserPage.fillNewPassword('totoCapco2019')
        AdminUserPage.saveProfilePasswordShouldNotBeDisabled()
        AdminUserPage.confirmSaveProfilePassword()
        AdminUserPage.notifSave()
    })
  })
})
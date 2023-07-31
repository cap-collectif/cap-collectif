export default new (class AdminUserPage{

    get cy() {
        return cy
    }

    pathProfileUser(userId: string) {
        return `admin/capco/user/user/${userId}/edit`
    }

    visitProfile(userId: string) {
        return this.cy.visit(this.pathProfileUser(userId))
    }

    userProfileAccountTab() {
        return this.cy.get('a[id="UserAdminPageTabs-tab-1"]')
    }

    userProfileTitle() {
        return this.cy.get('a[id="UserAdminPageTabs-tab-2"]').click()
    }
    
    userProfileData() {
        return this.cy.get('a[id="UserAdminPageTabs-tab-3"]').click()
    }

    userProfilePassword() {
        return this.cy.get('a[id="UserAdminPageTabs-tab-4"]').click()
    }

    //profile account

    get formLabelVip() {
        return this.cy.get('input[id="vip"]')
    }

    vipBeChecked() {
        this.formLabelVip.should('be.checked')
    }

    get formLabelEnabled() {
        return this.cy.get('input[id="enabled"]')
    }

    labelEnabledBeChecked() {
        this.formLabelEnabled.should('be.checked')
    }

    get inputFormLabelLocked() {
        return this.cy.get('input[id="locked"]')
    }

    get formLabelLocked() {
        return this.cy.get('label[id="label-checkbox-locked"]')
    }

    clickFormLabelLocked() {
        return this.formLabelLocked.click()
    }

    labelLockedNotBeChecked() {
        this.inputFormLabelLocked.should('not.be.checked')
    }

    get roleUser() {
        return this.cy.get('input[id="user_roles_choice-ROLE_USER"]')
    }

    roleUserBeChecked() {
        this.roleUser.should('be.checked')
    }

    get roleAdmin() {
        return this.cy.get('input[id="user_roles_choice-ROLE_ADMIN"]')
    }

    get roleSuperAdmin() {
        return this.cy.get('input[id="user_roles_choice-ROLE_SUPER_ADMIN"]')
    }

    roleSuperAdminShouldNotExist() {
        this.roleSuperAdmin.should('not.exist')
    }

    roleSuperAdminBeChecked() {
        this.roleSuperAdmin.should('be.checked')
    }

    get newsletter() {
        return this.cy.get('input[id="newsletter"]')
    }

    newsletterBeChecked() {
        this.newsletter.should('be.checked')
    }

    get proposalActualities() {
        return this.cy.get('input[id="isSubscribedToProposalNews"]')
    }

    get saveProfileAccount() {
        return this.cy.get('button[id="user_admin_account_save"]')
    }

    openDeleteProfileAccount() {
        return this.cy.get('button[id="delete-account-profile-button"]').click()
    }

    saveAccountButtonBeDisabled() {
        this.saveProfileAccount.should('be.disabled')
    }

    saveAccountButtonNotDisabled() {
        this.saveProfileAccount.should('not.be.disabled')
    }

    saveProfileAccountClicked() {
        this.saveProfileAccount.click()
    }

    deleteAccountAndAnonymize() {
        return this.cy.contains('delete-account-and-anonymize-contents').check()
    }

    deleteAccountAndContents() {
        return this.cy.contains('delete-account-and-contents').click()
    }

    confirmDeleteAccount() {
        return this.cy.get('button[id="confirm-delete-form-submit"]').click()
    }

    //profile title

    imageProfile(img: string) {
        return this.cy.get('input[id="profile_avatar_field"]').selectFile(`${img}`).wait(500)
    }

    get deleteImage() {
        return this.cy.get('label[id="label-checkbox-profile_avatar_delete"]')
    }

    get fullName() {
        return this.cy.get('input[id="profile-form-username"]')
    }

    get biography() {
        return this.cy.get('textarea[id="public-data-form-biography"]')
    }

    fillBiography(biography: string) {
        this.biography.type(`${biography}`)
    }

    get neighborhood() {
        return this.cy.get('input[id="public-data-form-neighborhood"]')
    }

    fillNeighborhood(neighborhood: string) {
        this.neighborhood.type(`${neighborhood}`)
    }

    get website() {
        return this.cy.get('input[id="public-data-form-website"]')
    }

    get facebook() {
        return this.cy.get('input[id="public-data-form-facebook"]')
    }

    get instagram() {
        return this.cy.get('input[id="public-data-form-instagram"]')
    }

    get twitter() {
        return this.cy.get('input[id="public-data-form-twitter"]')
    }

    get linkedin() {
        return this.cy.get('input[id="public-data-form-linkedIn"]')
    }

    get profilePageIndexed() {
        return this.cy.get('input[id="profilePageIndexed"]')
    }

    saveProfileTitle() {
        return this.cy.get('button[id="user-admin-profile-save"]').click()
    }

    //profile data

    get mail() {
        return this.cy.get('input[id="personal-data-email"]')
    }

    get firstName() {
        return this.cy.get('input[id="personal-data-form-firstname"]')
    }

    get name() {
        return this.cy.get('input[id="personal-data-form-lastname"]')
    }

    get gender() {
        return this.cy.get('select[id="personal-data-form-gender"]')
    }

    get dayOfBirth() {
        return this.cy.get('select[id="day"]')
    }

    get monthOfBirth() {
        return this.cy.get('select[id="month"]')
    }

    get yearOfBirth() {
        return this.cy.get('select[id="year"]')
    }

    get adress() {
        return this.cy.get('input[id="personal-data-form-address"]')
    }

    get adress2() {
        return this.cy.get('input[id="personal-data-form-address2"]')
    }

    get city() {
        return this.cy.get('input[id="city"]')
    }

    fillCity(city: string) {
        this.city.type(city)
    }

    get zipCode() {
        return this.cy.get('input[id="zipCode"]')
    }

    get phone() {
        return this.cy.get('input[id="phone"]')
    }    

    get identificationCode() {
        return this.cy.get('input[id="userIdentificationCode"]')
    }


    saveProfileData() {
        return this.cy.get('button[id="user-admin-personal-data-save"]').click({force:true})
    }

    //profile password

    get currentPassword() {
        return this.cy.get('input[id="password-form-current"]')
    }

    currentPwdShouldBeDisabled() {
        this.currentPassword.should('be.disabled')
    }

    fillCurrentPassword(pwd: string) {
        return this.currentPassword.type(pwd)
    }

    get newPassword() {
        return this.cy.get('input[id="password-form-new_password"]')
    }

    fillNewPassword(pwd: string) {
        return this.newPassword.type(pwd)
    }

    clearNewPassword() {
        return this.newPassword.clear()
    }

    newPwdShouldBeDisabled(){
        this.newPassword.should('be.disabled')
    }

    get saveProfilePassword() {
        return this.cy.get('button[id="user-admin-password-save"]')
    }

    confirmSaveProfilePassword() {
        return this.saveProfilePassword.click()
    }

    saveProfilePasswordShouldNotBeDisabled() {
        return this.saveProfilePassword.should('not.be.disabled')
    }

    notifSave() {
        this.cy.contains('global.saved').should('be.visible')
    }
})


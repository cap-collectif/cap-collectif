export default new (class AdminUserListPage{

    get cy() {
        return cy
    }

    pathUserList(){
        return 'admin/capco/user/user/list'
    }

    visitUserList(){
        return this.cy.visit(this.pathUserList())
    }

    addUser() {
        return this.cy.get('button[id="add-a-user-button"]').click()
    }

    get username() {
        return this.cy.get('input[id="username"]')
    }

    fillUsername(username: string) {
        return this.username.type(username)
    }

    clearUsername() {
        return this.username.clear()
    }

    get email() {
        return this.cy.get('input[id="email"]')
    }

    fillEmail(email: string){
        return this.email.type(email)
    }

    clearEmail(){
        return this.email.clear()
    }

    get password() {
        return this.cy.get('input[id="password"]')
    }

    fillPassword(pwd: string) {
        return this.password.type(pwd)
    }

    get roleUser() {
        return this.cy.get('label[id="label-checkbox-user_roles_choice-ROLE_USER"]')
    }

    clickRoleUser() {
        return this.roleUser.click()
    }

    get roleAdmin() {
        return this.cy.get('label[id="label-checkbox-user_roles_choice-ROLE_ADMIN"]')
    }

    clickRoleAdmin() {
        return this.roleAdmin.click()
    }

    get roleSuperAdmin() {
        return this.cy.get('label[id="label-checkbox-user_roles_choice-ROLE_SUPER_ADMIN"]')
    }

    clickRoleSuperAdmin() {
        return this.roleSuperAdmin.click()
    }

    get vip() {
        return this.cy.get('label[id="label-checkbox-vip"]')
    }

    clickVip() {
        return this.vip.click()
    }

    get enabled(){
        return this.cy.get('label[id="label-checkbox-enabled"]')
    }

    get locked() {
        return this.cy.get('label[id="label-checkbox-locked"]')
    }

    confirmUserCreate() {
        return this.cy.get('button[id="confirm-user-create"]').click()
    }

    cancelUserCreate() {
        return this.cy.get('button').contains('global.cancel').click()
    }

}) 
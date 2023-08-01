export default new(class UserInvitePage {

    get cy() {
        return cy
    }

    pathInviteUser() {
        return `admin/capco/user/invite/list`
    }

    visitInviteUser() {
        return this.cy.visit(this.pathInviteUser())
    }
})
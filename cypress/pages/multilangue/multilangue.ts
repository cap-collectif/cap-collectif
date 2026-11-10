export default new (class Multilangue {
  get cy() {
    return cy
  }

  visitProjectsPage(localePrefix = '') {
    const path = localePrefix ? `/${localePrefix}/projects` : '/projects'
    cy.get(`nav a[href$="${path}"]`).first().should('be.visible').click()
  }
})()

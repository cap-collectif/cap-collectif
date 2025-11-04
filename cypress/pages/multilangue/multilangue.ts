export default new (class Multilangue {
  get cy() {
    return cy
  }

  visitProjectsPage() {
    cy.get('nav[role="navigation"] a').contains('Projets participatifs').click()
  }
})()

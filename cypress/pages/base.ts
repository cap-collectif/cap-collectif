export default new (class Base {
  get cy() {
    return cy
  }

  visit(
    {
      path = '',
      operationName = '',
      withIntercept = true,
      failOnStatusCode = true,
    }: { operationName: string; path?: string; withIntercept?: boolean; failOnStatusCode?: boolean } = {
      operationName: '',
    },
  ) {
    if (withIntercept) cy.interceptGraphQLOperation({ operationName: operationName })
    this.cy.visit(path, { failOnStatusCode: failOnStatusCode })
    this.cy.wait(`@${operationName}`, { timeout: 10000 })
  }
  reload({ operationName }: { operationName: string }) {
    this.cy.reload()
    this.cy.wait(`@${operationName}`, { timeout: 10000 })
  }

  visitHomepage({
    lang = '',
    withIntercept = true,
    operationName = 'NavbarRightQuery',
  }: { lang?: string; withIntercept?: boolean; operationName?: string } = {}) {
    this.visit({ path: `${lang}/`, withIntercept, operationName })
  }
})()

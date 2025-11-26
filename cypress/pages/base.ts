export default new (class Base {
  get cy() {
    return cy
  }

  visit({
    path = '',
    operationName = '',
    failOnStatusCode = true,
  }: {
    operationName: string
    path?: string
    failOnStatusCode?: boolean
  }) {
    if (operationName) this.cy.interceptGraphQLOperation({ operationName })
    this.cy.visit(path, { failOnStatusCode: failOnStatusCode })
    if (operationName) {
      this.cy.wait(`@${operationName}`, { timeout: 10000 })
    }
  }

  reload({ operationName, timeout }: { operationName: string; timeout?: number }) {
    this.cy.reload()
    this.cy.wait(`@${operationName}`, { timeout: timeout ?? 10000 })
  }

  visitHomepage({ lang = '', operationName = 'NavbarRightQuery' }: { lang?: string; operationName?: string } = {}) {
    this.visit({ path: `${lang}/`, operationName })
  }
})()

export default new (class Base {
  get cy() {
    return cy
  }

  visit(
    {
      path = '',
      operationName = '',
      withIntercept = false,
    }: { operationName: string; path?: string; withIntercept?: boolean } = {
      operationName: '',
    },
  ) {
    if (withIntercept) cy.interceptGraphQLOperation({ operationName: operationName })
    this.cy.visit(path)
    this.cy.wait(`@${operationName}`)
  }
  reload({ operationName = '' }: { operationName?: string } = {}) {
    this.cy.reload()
    this.cy.wait(`@${operationName}`)
  }

  visitHomepage({
    lang = '',
    withIntercept = false,
    operationName = 'NavbarRightQuery',
  }: { lang?: string; withIntercept?: boolean; operationName?: string } = {}) {
    this.visit({ path: `${lang}/`, withIntercept, operationName })
  }
})()

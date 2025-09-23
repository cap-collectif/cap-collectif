export default new (class Base {
  get cy() {
    return cy
  }

  visit(
    { path = '', toWait = '', withIntercept = false }: { toWait: string; path?: string; withIntercept?: boolean } = {
      toWait: '',
    },
  ) {
    if (withIntercept) cy.interceptGraphQLOperation({ operationName: toWait })
    this.cy.visit(path)
    this.cy.wait(`@${toWait}`)
  }
  reload({ toWait = '' }: { toWait?: string } = {}) {
    this.cy.reload()
    this.cy.wait(`@${toWait}`)
  }

  visitHomepage({
    lang = '',
    withIntercept = false,
    toWait = 'NavbarRightQuery',
  }: { lang?: string; withIntercept?: boolean; toWait?: string } = {}) {
    this.visit({ path: `${lang}/`, withIntercept, toWait })
  }
})()

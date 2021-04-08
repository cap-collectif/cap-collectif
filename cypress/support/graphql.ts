Cypress.Commands.add('appendOperationToGraphQLFetch', () => {
  cy.on('window:before:load', win => {
    const originalFetch = win.fetch as any
    const fetch = (path: any, options: any, ...rest: any) => {
      if (options && options.body) {
        try {
          const body = JSON.parse(options.body)
          if (body.operationName) {
            return originalFetch(`${path}?operation=${body.operationName}`, options, ...rest)
          }
        } catch (e) {
          return originalFetch(path, options, ...rest)
        }
      }
      return originalFetch(path, options, ...rest)
    }
    cy.stub(win, 'fetch', fetch)
  })
})

Cypress.Commands.add(
  'interceptGraphQLOperation',
  ({ operationName, schema = 'internal', alias = operationName }: Cypress.InterceptGraphQLOperationOptions) => {
    return cy.intercept('POST', `/graphql/${schema}?operation=${operationName}`).as(alias)
  },
)

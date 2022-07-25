/// <reference types="cypress" />

/**
 * Public interface for the global "cy" object. If you want to add
 * a custom property to this object, you should extend this interface.
 * @see https://on.cypress.io/typescript#Types-for-custom-commands
 *
 ```
 // in your TS file
 declare namespace Cypress {
    interface cy {
      // declare additional properties on "cy" object, like
      // label: string
    }
    interface Chainable {
      // declare additional custom commands as methods, like
      // login(username: string, password: string)
    }
  }
 ```
 */

declare namespace Cypress {
  import { RouteHandler } from 'cypress/types/net-stubbing'

  type InterceptGraphQLOperationOptions = {
    readonly operationName: string
    readonly schema?: string
    readonly alias?: string
  }
  type LoginOptions = {
    email: string
    password: string
  }
  type LoginAsUsernames = 'admin' | 'super_admin' | 'project_owner' | 'user' | 'pierre' | 'user_not_confirmed'
  interface cy {
    appendOperationToGraphQLFetch(): void
  }
  interface Chainable {
    task(event: 'db:restore', arg?: any, options?: Partial<Loggable & Timeoutable>): Chainable<any>
    interceptGraphQLOperation(options: InterceptGraphQLOperationOptions, response?: RouteHandler): Chainable<null>
    assertReactSelectOptionCount(selector: string, value: number): Chainable<any>
    selectReactSelectOption(selector: string, query: string): Chainable<any>
    selectReactSetOption(selector: string, query: string): Chainable<any>
    checkAccessDenied(url: string): Chainable<any>
    login(options: LoginOptions): Chainable<any>
    confirmRecaptcha(): Chainable<void>
    loginAs(username: LoginAsUsernames): Chainable<any>
    directLoginAs(username: LoginAsUsernames): Chainable<any>
    directLogin(options: LoginOptions): Chainable<any>
  }
}

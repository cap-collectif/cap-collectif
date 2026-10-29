/**
 * @cypress-status compliant
 * @cypress-reason Back-office CRUD workflow following the social networks reference test.
 */
describe('Custom pages back office', () => {
  before(() => {
    cy.task('db:restore')
  })

  const visitCustomPagesPage = () => {
    cy.visit('/admin-next/custom-pages', { failOnStatusCode: false })
  }

  const fillVisibleField = (fieldId: string, value: string) => {
    cy.get(`#${fieldId}`).filter(':visible').should('exist').and('be.visible').clear().type(value, { delay: 0 })
  }

  const clickVisibleButton = (label: string) => {
    cy.contains('button', label).filter(':visible').should('exist').and('be.visible').click()
  }

  it('redirects a non-ROLE_ADMIN account away from the custom pages', () => {
    cy.directLoginAs('project_owner')
    visitCustomPagesPage()
    cy.url().should('contain', '/admin-next/403')
    cy.contains('unauthorized-access').should('be.visible')
  })

  it('creates, edits and deletes a custom page through the back office', () => {
    const title = `Cypress custom page ${Date.now()}`
    const updatedTitle = `${title} updated`

    cy.directLoginAs('admin')
    cy.interceptGraphQLOperation({ operationName: 'customPages_Query' })
    visitCustomPagesPage()
    cy.wait('@customPages_Query')

    clickVisibleButton('admin.custom-pages.create')
    fillVisibleField('FR_FR-title', title)
    cy.get('.jodit-wysiwyg').filter(':visible').type('Cypress content', { delay: 0 })
    cy.interceptGraphQLOperation({ operationName: 'CreatePageMutation' })
    cy.interceptGraphQLOperation({ operationName: 'CustomPageFormWrapperQuery' })
    clickVisibleButton('btn_create')
    // GraphQL answers 200 even on failure, so assert on the payload rather than the HTTP status.
    cy.wait('@CreatePageMutation').its('response.body.data.createPage.errorCode').should('eq', null)

    // The creation form already has this title; wait for the edit form before modifying it.
    cy.wait('@CustomPageFormWrapperQuery')
    cy.location('pathname').should('eq', '/admin-next/custom-page')
    cy.location('search').should('contain', 'id=')
    cy.get('#FR_FR-title').filter(':visible').should('have.value', title)
    fillVisibleField('FR_FR-title', updatedTitle)
    cy.get('.cap-switch__slider').click()
    cy.interceptGraphQLOperation({ operationName: 'UpdatePageMutation' })
    clickVisibleButton('global.save')
    cy.wait('@UpdatePageMutation').its('response.body.data.updatePage.errorCode').should('eq', null)

    cy.interceptGraphQLOperation({ operationName: 'customPages_Query' })
    visitCustomPagesPage()
    cy.wait('@customPages_Query')
    cy.contains(updatedTitle)
      .closest('tr')
      .within(() => {
        cy.contains('global.no').should('be.visible')
        cy.get(`button[aria-label="global.delete ${updatedTitle}"]`)
          .scrollIntoView()
          .should('exist')
          .and('be.visible')
          .click()
      })
    cy.get('[data-cy="deletion-confirmation"]').click()
    cy.contains('admin.custom-pages.successfully-deleted').should('be.visible')

    cy.contains(updatedTitle).should('not.exist')
  })
})

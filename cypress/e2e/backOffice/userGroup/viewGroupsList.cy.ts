import { AdminGroupsPage } from 'cypress/pages/index'

describe('Displays or not the page based on the viewer', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  it('cannot visit groups list page when logged as a user', () => {
    cy.directLoginAs('user')
    cy.interceptGraphQLOperation({ operationName: 'groups_Query' })
    // eslint-disable-next-line jest/valid-expect-in-promise
    cy.request({
      url: AdminGroupsPage.pathGroupsList(),
      method: 'GET',
      failOnStatusCode: false,
    }).then(response => {
      // Regular users should not be able to access admin pages
      // Expect either a redirect (302) or error (500) or the response body to be empty/null
      const responseBody = response.allRequestResponses[0]['Response Body']
      assert.isNull(responseBody)
    })
  })

  it('visits groups list when logged in as admin', () => {
    cy.directLoginAs('admin')
    AdminGroupsPage.visitGroupsList()
    cy.checkTableLength(9)
    cy.get('.cap-table__tbody .cap-table__tr')
      .eq(1)
      .within(() => {
        AdminGroupsPage.getRowCellByColumnIndex(0).should('contain', 'Agent de la ville')
        AdminGroupsPage.getRowCellByColumnIndex(1).should('contain', 'Lorem ipsum dolor sit amet sapien estiam')
        AdminGroupsPage.getRowCellByColumnIndex(2).should('contain', '3')
        AdminGroupsPage.getRowCellByColumnIndex(3).find('button').should('have.attr', 'aria-label', 'global.delete')
      })

    cy.get('.cap-table__tbody .cap-table__tr')
      .eq(2)
      .within(() => {
        AdminGroupsPage.getRowCellByColumnIndex(0).should('contain', 'Utilisateurs')
        AdminGroupsPage.getRowCellByColumnIndex(1).should('contain', 'Lorem ipsum dolor sit amet sapien estiam')
        AdminGroupsPage.getRowCellByColumnIndex(2).should('contain', '129')
        AdminGroupsPage.getRowCellByColumnIndex(3).find('button').should('have.attr', 'aria-label', 'global.delete')
      })
  })

  it('views filtered groups', () => {
    cy.directLoginAs('admin')
    AdminGroupsPage.visitGroupsList()
    cy.get('div.cap-search').click({ force: true }).type('Agent')
    cy.checkTableLength(1)
    AdminGroupsPage.getRowCellByColumnIndex(0).should('contain', 'Agent de la ville')
  })
})

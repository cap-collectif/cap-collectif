import { Base } from '~e2e-pages/index'

context('Projects Features', () => {
  beforeEach(() => {
    cy.task('db:restore')
  })

  describe('Access to admin project pages', () => {
    it('should access admin project pages without errors', () => {
      cy.directLoginAs('admin')
      const urls = [
        '/admin-next/projects',
        '/admin-next/forms',
        '/admin/capco/app/sourcecategory/list',
        '/admin/capco/app/consultation/list',
        '/admin/capco/app/projecttype/list',
        '/admin/capco/app/proposalform/list',
      ]

      urls.forEach(url => {
        // eslint-disable-next-line jest/valid-expect-in-promise
        cy.request({
          url,
          failOnStatusCode: false,
        }).then(response => {
          expect(response.status).to.not.equal(500)
          expect(response.status).to.not.equal(404)
        })
      })
    })
  })

  describe('Project visibility', () => {
    it('should show a project in another window', () => {
      cy.directLoginAs('admin')

      Base.visit({ path: '/admin-next/projects', operationName: 'projectsQuery' })

      cy.get('.cap-table__tbody')
        .children()
        .eq(2)
        .within(() => {
          cy.get('.cap-menu__disclosure').click({ force: true })
        })

      cy.interceptGraphQLOperation({ operationName: 'NavBarMenuQuery' })
      cy.contains('button', 'action_show').click({ force: true })
      cy.wait('@NavBarMenuQuery', { timeout: 10000 })
    })

    it("should allow another admin to see admin's project in BO", () => {
      cy.directLoginAs('project_owner')

      Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from failing the test
        return false
      })
      Base.visit({ path: '/admin-next/projects', operationName: 'projectsQuery' })
      cy.contains('no-result').should('not.exist')
      cy.get('.cap-table__td').contains('admin')
    })

    it('should allow author to see his personal project in BO', () => {
      cy.directLoginAs('admin')

      Base.visit({ path: '/admin-next/projects', operationName: 'projectsQuery' })
      cy.contains('no-result').should('not.exist')
      cy.get('.cap-table__td').contains('admin')
    })
  })

  describe('Project deletion', () => {
    it('should delete a project on project list', () => {
      cy.directLoginAs('admin')
      Base.visit({ path: '/admin-next/projects', operationName: 'projectsQuery' })

      cy.get('.cap-table__tbody')
        .children()
        .eq(2)
        .within(() => {
          cy.get('.cap-menu__disclosure').click({ force: true })
        })
      cy.contains('button', 'admin.global.delete').click({ force: true })
    })
  })
})

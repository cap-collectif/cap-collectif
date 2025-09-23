import { Base } from 'cypress/pages/index'

describe('Homepage', () => {
  beforeEach(() => {
    cy.interceptGraphQLOperation({ operationName: 'NavbarRightQuery' })
  })
  it('should display section', () => {
    Base.visitHomepage()

    cy.contains('Section activée').should('exist')
    cy.contains('Section désactivée').should('not.exist')
  })

  it('should display limited projects and a "more projects" button', () => {
    cy.task('enable:feature', 'themes')
    Base.visitHomepage()

    cy.get('.cap-project-card').should('have.length', 4)
    cy.get('.see-more-projects-button').should('have.length', 1)
  })

  it('should display links when features are enabled', () => {
    cy.directLoginAs('super_admin')
    cy.task('disable:feature', 'developer_documentation')

    Base.visit({
      path: '/admin/features/developer_documentation/switch',
      toWait: 'AdminRightNavbarAppQuery',
      withIntercept: true,
    })

    Base.visitHomepage({ toWait: 'NavBarMenuQuery', withIntercept: true })
    cy.get('#footer-links').should('exist')
    cy.contains('#footer-links', 'Développeurs').should('exist')
  })

  it("shouldn't display links when features are disabled", () => {
    cy.directLoginAs('super_admin')
    cy.task('enable:feature', 'developer_documentation')

    Base.visit({
      path: '/admin/features/developer_documentation/switch',
      toWait: 'AdminRightNavbarAppQuery',
      withIntercept: true,
    })

    Base.visitHomepage({ toWait: 'NavBarMenuQuery', withIntercept: true })
    cy.get('#footer-links').should('exist')
    cy.contains('#footer-links', 'Développeurs').should('not.exist')
  })
})

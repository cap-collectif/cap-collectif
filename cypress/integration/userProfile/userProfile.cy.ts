describe('Anonymous wants to see the profile of a user', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'profiles')
    cy.task('enable:feature', 'new_project_card')

    // TODO: investigate why when logged in as user, the #profile-source section is not displayed
    // cy.directLoginAs('user')
  })

  it('should display various elements on the user profile', () => {
    cy.interceptGraphQLOperation({ operationName: 'SourcePageQuery' })
    // We visit two different profiles to view all the possible sections that are not all present on the same profile
    cy.visit('/fr/profile/admin')
    cy.wait('@SourcePageQuery', { timeout: 10000 })
    cy.get('#profile-argument').within(() => {
      cy.get('.list-group-item').should('have.length.greaterThan', 0)
    })
    cy.get('#profile-proposal').within(() => {
      cy.get('.proposal-preview-list').should('have.length.greaterThan', 0)
    })
    cy.get('#profile-reply').within(() => {
      cy.get('.opinion__data').should('have.length.greaterThan', 0)
    })
    cy.get('#profile-vote').within(() => {
      cy.get('.opinion__data').should('have.length.greaterThan', 0)
    })
    cy.get('#profile-version').within(() => {
      cy.get('#versions-list .list-group-item').should('have.length.greaterThan', 0)
    })

    // Second profile
    cy.visit('/fr/profile/sfavot')
    cy.wait('@SourcePageQuery', { timeout: 10000 })
    cy.get('#profile-source').within(() => {
      cy.get('.list-group-item__opinion').should('have.length.greaterThan', 0)
    })

    cy.get('.opinion__list .list-group-item__opinion').should('have.length.greaterThan', 0)
    cy.get('#profile-project').within(() => {
      cy.get('.cap-card').should('have.length.greaterThan', 0)
    })
    cy.get('#profile-comment').within(() => {
      cy.get('.opinion__data').should('have.length.greaterThan', 0)
    })
  })
})

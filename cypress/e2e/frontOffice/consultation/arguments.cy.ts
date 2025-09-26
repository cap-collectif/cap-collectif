describe('Argument', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })
  it('Logged in user wants to vote for an argument on an opinion then delete his vote', () => {
    cy.interceptGraphQLOperation({ operationName: 'ArgumentListQuery' })
    cy.interceptGraphQLOperation({ operationName: 'OpinionPageQuery' })
    cy.interceptGraphQLOperation({ operationName: 'AddArgumentVoteMutation' })
    cy.interceptGraphQLOperation({ operationName: 'RemoveArgumentVoteMutation' })
    cy.visit(
      '/consultations/croissance-innovation-disruption/consultation/collecte-des-avis/opinions/les-causes/opinion-2',
    )
    cy.wait('@OpinionPageQuery')
    cy.wait('@ArgumentListQuery')
    cy.wait('@ArgumentListQuery')
    cy.get('#arg-QXJndW1lbnQ6YXJndW1lbnQx .argument__btn--vote').click({ force: true })
    cy.wait('@AddArgumentVoteMutation')
    cy.get('.toasts-container--top div').should('contain', 'vote.add_success')
    cy.get('#arg-QXJndW1lbnQ6YXJndW1lbnQx .argument__btn--vote').click({ force: true })
    cy.wait('@RemoveArgumentVoteMutation')
    cy.get('.toasts-container--top div').should('contain', 'vote.delete_success')
  })
  it('Logged in user wants to vote for an argument on a version then delete his vote', () => {
    cy.interceptGraphQLOperation({ operationName: 'ArgumentListQuery' })
    cy.interceptGraphQLOperation({ operationName: 'OpinionPageQuery' })
    cy.interceptGraphQLOperation({ operationName: 'AddArgumentVoteMutation' })
    cy.interceptGraphQLOperation({ operationName: 'RemoveArgumentVoteMutation' })
    cy.visit(
      '/projects/projet-de-loi-renseignement/consultation/elaboration-de-la-loi/opinions/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques/article-1/versions/modification-1',
    )
    cy.wait('@OpinionPageQuery')
    cy.wait('@ArgumentListQuery')
    cy.get('#arg-QXJndW1lbnQ6YXJndW1lbnQyMDU\\= .argument__btn--vote').click({ force: true })
    cy.wait('@AddArgumentVoteMutation')
    cy.get('.toasts-container--top div').should('contain', 'vote.add_success')
    cy.get('#arg-QXJndW1lbnQ6YXJndW1lbnQyMDU\\= .argument__btn--vote').click({ force: true })
    cy.wait('@RemoveArgumentVoteMutation')
    cy.get('.toasts-container--top div').should('contain', 'vote.delete_success')
  })
})

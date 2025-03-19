export default new (class OpinionPage {
  get cy() {
    return cy
  }

  visitOpinionDetailsPage() {
    cy.interceptGraphQLOperation({ operationName: 'OpinionPageQuery' })
    this.cy.visit(
      '/consultations/projet-de-loi-renseignement/consultation/elaboration-de-la-loi/opinions/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques/sous-partie-1/opinion-d-hier-69',
    )
    return cy.wait('@OpinionPageQuery', { timeout: 10000 })
  }

  visitRankingStepWithOpinionPage() {
    this.cy.visit('/project/croissance-innovation-disruption/ranking/classement-des-propositions-et-modifications')
  }

  visitOpinionsPage() {
    cy.interceptGraphQLOperation({ operationName: 'OpinionListQuery' })
    this.cy.visit('/project/projet-de-loi-renseignement/consultation/elaboration-de-la-loi')
    return cy.wait('@OpinionListQuery', { timeout: 10000 })
  }

  getSingleOpinion() {
    return this.cy.get('.opinion-list-rendered').children().first()
  }

  getShowAllOpinionVotes() {
    return this.cy.get('#opinion-votes-show-all')
  }
  getShareOpinionButton() {
    return this.cy.get('#opinion-share-button')
  }
})()

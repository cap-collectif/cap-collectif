import Base from './base'

export default new (class OpinionPage {
  get cy() {
    return cy
  }

  visitConsultationDetailsPage() {
    cy.interceptGraphQLOperation({ operationName: 'OpinionPageQuery' })
    this.cy.visit(
      '/consultations/projet-de-loi-renseignement/consultation/elaboration-de-la-loi/opinions/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques/sous-partie-1/opinion-d-hier-69',
    )
    return cy.wait('@OpinionPageQuery', { timeout: 10000 })
  }

  visitRankingStepWithOpinionPage() {
    this.cy.visit('/project/croissance-innovation-disruption/ranking/classement-des-propositions-et-modifications')
  }

  visitConsultationsPage({
    projectSlug,
    stepSlug,
    consultationSlug,
    typeSlug,
  }: {
    projectSlug: string
    stepSlug: string
    consultationSlug?: string
    typeSlug?: string
  }) {
    const path = `/project/${projectSlug}/consultation/${stepSlug}${consultationSlug ? `/${consultationSlug}` : ''}${
      typeSlug ? `/types/${typeSlug}` : ''
    }`
    Base.visit({ path, operationName: 'OpinionListQuery' })
  }

  visitOpinionsPage({
    projectSlug,
    stepSlug,
    opinionTypeSlug,
    opinionSlug,
  }: {
    projectSlug: string
    stepSlug: string
    opinionTypeSlug: string
    opinionSlug: string
  }) {
    const path = `/projects/${projectSlug}/consultation/${stepSlug}/opinions/${opinionTypeSlug}/${opinionSlug}`
    Base.visit({ path, operationName: 'ArgumentListQuery' })
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

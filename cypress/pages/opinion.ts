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
    operationName = 'ArgumentListQuery',
  }: {
    projectSlug: string
    stepSlug: string
    opinionTypeSlug: string
    opinionSlug: string
    operationName?: string
  }) {
    const path = `/projects/${projectSlug}/consultation/${stepSlug}/opinions/${opinionTypeSlug}/${opinionSlug}`
    Base.visit({ path, operationName })
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

  /* Versions */
  visitVersionPage(operationName = 'ArgumentListQuery') {
    Base.visit({
      path: '/projects/projet-de-loi-renseignement/consultation/elaboration-de-la-loi/opinions/titre-ier-la-circulation-des-donnees-et-du-savoir/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques/article-1/versions/modification-1',
      operationName: operationName,
      failOnStatusCode: false,
    })
  }
  visitVersionClosedPage(operationName = 'ArgumentListQuery') {
    Base.visit({
      path: '/projects/strategie-technologique-de-letat-et-services-publics/consultation/collecte-des-avis-pour-une-meilleur-strategie/opinions/les-causes/opinion-51/versions/version-sur-une-etape-fermee',
      operationName: operationName,
    })
  }
  visitVersionWithVotesPage(operationName = 'ArgumentListQuery') {
    Base.visit({
      path: '/projects/projet-de-loi-renseignement/consultation/elaboration-de-la-loi/opinions/chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques/article-1/versions/modification-2',
      operationName: operationName,
    })
  }
  visitVersionToEditPage(operationName = 'ArgumentListQuery') {
    Base.visit({
      path: '/projects/project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement/consultation/etape-participation-continue/opinions/premiere-section-encore-un-sous-titre/opinion-endless/versions/modification-16',
      operationName: operationName,
    })
  }

  visitOpinionArgument() {
    this.visitOpinionsPage({
      projectSlug: 'croissance-innovation-disruption',
      stepSlug: 'collecte-des-avis',
      opinionTypeSlug: 'les-causes',
      opinionSlug: 'opinion-2',
    })
  }
  visitOpinionClosed() {
    this.visitOpinionsPage({
      projectSlug: 'strategie-technologique-de-letat-et-services-publics',
      stepSlug: 'collecte-des-avis-pour-une-meilleur-strategie',
      opinionTypeSlug: 'les-causes',
      opinionSlug: 'opinion-51',
      operationName: 'OpinionPageQuery',
    })
  }
  submitArgument({ content = '' }: { content: string }) {
    this.cy.get(`#argument-form--FOR`).within(() => {
      this.cy.get('textarea').type(content)
      this.cy.interceptGraphQLOperation({ operationName: 'AddArgumentMutation' })
      this.cy.get('button').click({ force: true })
      this.cy.wait('@AddArgumentMutation', { timeout: 10000 })
    })
    this.cy.get('#opinion__arguments--FOR').should('exist').and('be.visible').invoke('text').should('contain', content)
  }

  editArgument({ content = '' }: { content: string }) {
    this.cy.get('#edit-button').click({ force: true })
    this.cy
      .get('#argument-form')
      .should('be.visible')
      .within(() => {
        this.cy.get('textarea').clear().type(content)
        this.cy.get('[name="confirm"]').check({ force: true })
      })
    this.cy.interceptGraphQLOperation({ operationName: 'ChangeArgumentMutation' })
    this.cy.get('#confirm-argument-update').click({ force: true })
    this.cy.wait('@ChangeArgumentMutation', { timeout: 10000 })
    this.cy.get('.opinion__text').should('exist').and('be.visible').invoke('text').should('contain', content)
  }

  editArgumentWithoutConfirm({ content = '' }: { content: string }) {
    this.cy.get('#edit-button').click({ force: true })
    this.cy
      .get('#argument-form')
      .should('be.visible')
      .within(() => {
        this.cy.get('textarea').clear().type(content)
      })
    this.cy.get('#confirm-argument-update').click({ force: true })
    this.cy.get('#argument-form').should('contain', 'argument.constraints.confirm')
  }

  deleteArgument() {
    this.cy.get('#delete-button').click({ force: true })
    this.cy.interceptGraphQLOperation({ operationName: 'DeleteArgumentMutation' })
    this.cy.get('#confirm-argument-delete').click({ force: true })
    this.cy.wait('@DeleteArgumentMutation')
  }
})()

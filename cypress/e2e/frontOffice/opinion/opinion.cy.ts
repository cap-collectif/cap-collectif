import { OpinionPage } from '~e2e-pages/index'

describe('Opinion Page Tests', () => {
  before(() => {
    cy.task('db:restore')
  })
  context('As an anonymous user', () => {
    before(() => {
      cy.task('enable:feature', 'share_buttons')
      cy.task('disable:feature', 'shield_mode')
    })
    it('should display all votes of an opinion', () => {
      OpinionPage.visitConsultationDetailsPage()
      OpinionPage.getShowAllOpinionVotes().click()
      cy.get('.opinion__votes__more__modal')
        .should('exist')
        .and('be.visible')
        .find('.card')
        .should('exist')
        .and('be.visible')
        .and('have.length', 29)
    })

    it('should display the opinion share dropdown', () => {
      cy.interceptGraphQLOperation({ operationName: 'OpinionPageQuery' })
      cy.interceptGraphQLOperation({ operationName: 'OpinionListQuery' })
      OpinionPage.visitConsultationsPage({
        projectSlug: 'projet-de-loi-renseignement',
        stepSlug: 'elaboration-de-la-loi',
      })
      OpinionPage.getSingleOpinion().find('.card__title a').click()
      cy.wait('@OpinionPageQuery', { timeout: 10000 })
      OpinionPage.getShareOpinionButton().click()

      cy.get('.share-button-dropdown').should('exist').and('be.visible')
      cy.get('.share-option').should('be.visible').and('have.length', 5)
      cy.get('.share-option').contains('share.linkedin').should('exist')
      cy.get('.share-option').eq(3).should('have.attr', 'href')
      cy.get('.share-option').eq(4).click()
      cy.get('.modal--share-link').should('exist').and('be.visible')
    })

    it('should not display error 500 on ranking step with opinions', () => {
      OpinionPage.visitRankingStepWithOpinionPage()
      cy.contains('error.500').should('not.exist')
    })

    it('should not be able to create an opinion', () => {
      cy.interceptGraphQLOperation({ operationName: 'OpinionListQuery' })
      OpinionPage.visitConsultationsPage({
        projectSlug: 'croissance-innovation-disruption',
        stepSlug: 'collecte-des-avis',
      })

      cy.get('#btn-add--les-causes').click()
      cy.get('#login-popover').should('be.visible')
    })

    it('should be able to sort project randomly', () => {
      cy.task('enable:feature', 'projects_form')
      cy.interceptGraphQLOperation({ operationName: 'OpinionListQuery' })

      OpinionPage.visitConsultationsPage({
        projectSlug: 'projet-avec-beaucoup-dopinions',
        stepSlug: 'consultation-step-in-project-with-many-opinions',
        consultationSlug: 'consultation-in-project-with-many-opinions',
        typeSlug: 'opinion-type-avec-beaucoup-doptions',
      })

      cy.get('#opinion-ordering-selector').select('global.filter_random')
      cy.get('#OpinionListPaginated-loadmore').should('be.visible')
      cy.get('.opinion-list-rendered').children().should('have.length', 51)
      cy.scrollTo('bottom')

      cy.interceptGraphQLOperation({ operationName: 'OpinionListPaginatedQuery' })
      cy.get('#OpinionListPaginated-loadmore').click()
      cy.wait('@OpinionListPaginatedQuery', { timeout: 10000 })

      cy.get('#OpinionListPaginated-end-pagination').should('exist')
      cy.get('.opinion-list-rendered').children().should('have.length', 72)
    })
  })

  context('As a logged user', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('user')
    })
    it('should be able to create an opinion', () => {
      OpinionPage.visitConsultationsPage({
        projectSlug: 'croissance-innovation-disruption',
        stepSlug: 'collecte-des-avis',
      })

      cy.get('#btn-add--les-causes').should('be.visible')
      cy.get('#btn-add--les-causes').click({ force: true })
      cy.get('#opinion-create-form').should('be.visible')
      cy.get('#opinion_title').should('be.visible')
      cy.get('#opinion_title').type('Titre')
      cy.get('#opinion_body').type('Description de ma proposition')

      cy.interceptGraphQLOperation({ operationName: 'ArgumentListQuery' })
      cy.get('[id="confirm-opinion-create"]').click({ force: true })
      cy.wait('@ArgumentListQuery', { timeout: 10000 })

      cy.url().should(
        'include',
        '/consultations/croissance-innovation-disruption/consultation/collecte-des-avis/opinions/les-causes/titre',
      )
    })

    it('should not be able to create an opinion in non-contribuable', () => {
      OpinionPage.visitConsultationsPage({
        projectSlug: 'croissance-innovation-disruption',
        stepSlug: 'collecte-des-avis',
      })
      cy.get('#opinions--test17le-probleme-constate').should('be.visible')
      cy.get('#btn-add--le-probleme-constate').should('not.exist')
    })

    it('should be able to paginate opinions inside a section', () => {
      OpinionPage.visitConsultationsPage({
        projectSlug: 'projet-de-loi-renseignement',
        stepSlug: 'elaboration-de-la-loi',
        consultationSlug: 'projet-de-loi',
        typeSlug: 'chapitre-ier-economie-de-la-donnee/section-1-ouverture-des-donnees-publiques/sous-partie-1',
      })

      cy.get('.card__header').should('be.visible')
      cy.get('.list-group-item__opinion').should('have.length', 50)

      cy.get('#OpinionListPaginated-loadmore').click()
      cy.get('.list-group-item__opinion').should('have.length', 58)
    })

    it('should not be able to create an opinion of non-contribuable', () => {
      OpinionPage.visitConsultationsPage({
        projectSlug: 'croissance-innovation-disruption',
        stepSlug: 'collecte-des-avis',
      })

      cy.get('#opinions--le-probleme-constate').should('have.length', 0)
    })

    it('should not be able to create an opinion in closed project', () => {
      OpinionPage.visitConsultationsPage({
        projectSlug: 'strategie-technologique-de-letat-et-services-publics',
        stepSlug: 'collecte-des-avis-pour-une-meilleur-strategie',
      })

      cy.get('#main').should('contain', 'step.consultation.alert.ended.title')
      cy.get('#main').should('contain', 'thank.for.contribution')
      cy.get('[id^="btn-add"]').should('be.disabled')
    })

    it('should remove all vote on an opinion if it is updated', () => {
      cy.interceptGraphQLOperation({ operationName: 'ArgumentListQuery' })
      OpinionPage.visitOpinionsPage({
        projectSlug: 'croissance-innovation-disruption',
        stepSlug: 'collecte-des-avis',
        opinionTypeSlug: 'enjeux',
        opinionSlug: 'opinion-3',
      })

      // should contains 1
      cy.contains('global.votes')
      cy.contains('global.edit').click()

      cy.get('#opinion-edit-form').should('be.visible')
      cy.get('#opinion_body').clear().type('Je modifie ma proposition !')

      cy.get('#label-checkbox-opinion_check').click()
      cy.get('#confirm-opinion-update').click()

      cy.get('#confirm-opinion-update').should('not.exist')
      cy.url().should('include', '/opinions/les-enjeux/opinion-3')
      cy.get('#OpinionBox').should('be.visible')
      // should contains 0
      cy.contains('global.votes')
    })
  })

  context('As a logged admin', () => {
    beforeEach(() => {
      cy.directLoginAs('admin')
    })
    it('should see opinions in project with endless participation', () => {
      cy.interceptGraphQLOperation({ operationName: 'OpinionListQuery' })
      OpinionPage.visitConsultationsPage({
        projectSlug: 'project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement',
        stepSlug: 'etape-participation-continue',
      })
      cy.contains('Étape participation continue')
    })

    it('should report an opinion', () => {
      cy.task('enable:feature', 'reporting')
      cy.interceptGraphQLOperation({ operationName: 'ArgumentListQuery' })
      OpinionPage.visitOpinionsPage({
        projectSlug: 'croissance-innovation-disruption',
        stepSlug: 'collecte-des-avis',
        opinionTypeSlug: 'enjeux',
        opinionSlug: 'opinion-3',
      })

      cy.get('button[id^="report-opinion"]').click()
      cy.get('#reportBody').should('be.visible')
      cy.get('#reportBody').type('Pas terrible tout ça...')
      cy.get('#reportType').should('be.visible')
      cy.get('#reportType').select('reporting.status.spam')
      cy.get('#report-button-submit').click()

      cy.get('.toasts-container--top div').should('contain', 'alert.success.report.proposal')
    })

    it('should not update opinion if not the author', () => {
      cy.interceptGraphQLOperation({ operationName: 'ArgumentListQuery' })
      OpinionPage.visitOpinionsPage({
        projectSlug: 'croissance-innovation-disruption',
        stepSlug: 'collecte-des-avis',
        opinionTypeSlug: 'enjeux',
        opinionSlug: 'opinion-3',
      })

      cy.get('.opinion__description .opinion__buttons').should('not.contain', 'global.change')
    })
  })
})

describe('Opinion List Page', () => {
  context('As an anonymous user', () => {
    beforeEach(() => {
      cy.interceptGraphQLOperation({ operationName: 'OpinionListQuery' })
    })
    it('should display 3 opinions for "les-enjeux"', () => {
      OpinionPage.visitConsultationsPage({
        projectSlug: 'croissance-innovation-disruption',
        stepSlug: 'collecte-des-avis',
        consultationSlug: 'defaut',
        typeSlug: 'les-enjeux',
      })

      // should contains 3
      cy.contains('global.opinionsCount').should('exist')
    })

    it('should display 38 opinions for "les-causes"', () => {
      OpinionPage.visitConsultationsPage({
        projectSlug: 'croissance-innovation-disruption',
        stepSlug: 'collecte-des-avis',
        consultationSlug: 'defaut',
        typeSlug: 'les-causes',
      })

      // should contains 38
      cy.contains('global.opinionsCount').should('exist')
    })
  })
})

import { Base } from '~e2e-pages/index'

describe('Project', () => {
  describe('when filtering projects with theme page', () => {
    before(() => {
      cy.task('enable:feature', 'themes')
      cy.task('enable:feature', 'projects_form')
    })

    it('displays filtered project cards', () => {
      Base.visit({ path: '/themes/immobilier', operationName: 'ProjectsListQuery' })
      Cypress.on('uncaught:exception', (err, runnable) => {
        // returning false here prevents Cypress from failing the test
        return false
      })
      cy.get('.cap-project-card').should('have.length', 7)
    })
  })

  describe('when viewing presentation step', () => {
    before(() => {
      cy.task('enable:feature', 'blog')
    })

    it('displays correct number of news items', () => {
      Base.visit({
        path: '/project/croissance-innovation-disruption/presentation/presentation-1',
        operationName: 'PresentationStepPageQuery',
      })
      cy.get('.media--news').should('have.length', 2)
    })
  })

  describe('when viewing project posts menu', () => {
    before(() => {
      cy.task('enable:feature', 'blog')
    })

    it('displays correct number of posts', () => {
      Base.visit({
        path: '/project/croissance-innovation-disruption',
        operationName: 'NavbarRightQuery',
      })

      cy.get('#presentationStep-pstep1 .excerpt').contains('5')
    })
  })

  describe('when viewing project header', () => {
    it('displays correct number of votes', () => {
      Base.visit({
        path: '/project/croissance-innovation-disruption/consultation/collecte-des-avis',
        operationName: 'OpinionListQuery',
      })

      cy.get('#votes-counter-pill').should('contain.text', '10')
    })
  })

  describe('when export is disabled', () => {
    it('does not show download button', () => {
      Base.visit({
        path: '/project/strategie-technologique-de-letat-et-services-publics/consultation/collecte-des-avis-pour-une-meilleur-strategie',
        operationName: 'OpinionListQuery',
      })

      cy.get('#main').should('not.contain.text', 'project.download.button')
    })

    it('prevents direct download access', () => {
      Base.visit({
        path: '/projets/strategie-technologique-de-letat-et-services-publics/projet/collecte-des-avis-pour-une-meilleur-strategie/download',
        operationName: 'NavbarRightQuery',

        failOnStatusCode: false,
      })
      cy.contains('error.404.title').should('be.visible')
    })
  })

  describe('when trash feature is disabled', () => {
    it('does not show trash link for logged user', () => {
      cy.directLoginAs('user')
      Base.visit({
        path: '/project/croissance-innovation-disruption/consultation/collecte-des-avis',
        operationName: 'OpinionListQuery',
      })
      cy.get('#main').should('not.contain.text', 'project.trash')
    })
  })

  describe('when anonymous user accesses private project', () => {
    it('displays login modal', () => {
      Base.visit({
        path: '/project/qui-doit-conquerir-le-monde-visible-par-les-admins-seulement/collect/collecte-des-propositions-pour-conquerir-le-monde',
        operationName: 'NavbarRightQuery',

        failOnStatusCode: false,
      })

      cy.contains('global.login', { timeout: 15000 }).should('be.visible')
    })
  })

  describe('when accessing wrong project URL', () => {
    it('displays 404 error', () => {
      Base.visit({
        path: '/project/qui-doit-conquerir-fautedefrappe-visible-par-les-admins-seulement-seulement/collect/collecte-des-propositions-pour-conquerir-le-monde',
        operationName: 'NavbarRightQuery',

        failOnStatusCode: false,
      })

      cy.contains('404-error').should('be.visible')
    })
  })

  describe('when anonymous user accesses restricted project', () => {
    it('displays login modal', () => {
      Base.visit({
        path: '/project/un-avenir-meilleur-pour-les-nains-de-jardins-custom-access/collect/collecte-des-propositions-liberer-les-nains-de-jardin',
        operationName: 'NavbarRightQuery',

        failOnStatusCode: false,
      })

      cy.contains('global.login', { timeout: 15000 }).should('be.visible')
    })
  })

  describe('when unauthorized user accesses private project', () => {
    it('displays unauthorized message and allows reporting', () => {
      cy.directLoginAs('user')
      Base.visit({
        path: '/project/qui-doit-conquerir-le-monde-visible-par-les-admins-seulement/collect/collecte-des-propositions-pour-conquerir-le-monde',
        operationName: 'NavBarMenuQuery',

        failOnStatusCode: false,
      })

      cy.contains('unauthorized-access').should('be.visible')
      cy.contains('error.report').click({ force: true })
      cy.url().should('include', '/contact')
    })
  })

  describe('when user accesses restricted project', () => {
    it('displays unauthorized message', () => {
      cy.directLoginAs('user')
      Base.visit({
        path: '/project/un-avenir-meilleur-pour-les-nains-de-jardins-custom-access/collect/collecte-des-propositions-liberer-les-nains-de-jardin',
        operationName: 'NavBarMenuQuery',

        failOnStatusCode: false,
      })

      cy.contains('unauthorized-access').should('be.visible')
    })
  })

  describe('when super admin accesses private projects', () => {
    before(() => {
      cy.task('enable:feature', 'projects_form')
    })

    beforeEach(() => {
      cy.directLoginAs('super_admin')
    })

    it('can access admin-only project', () => {
      Base.visit({
        path: '/project/qui-doit-conquerir-le-monde-visible-par-les-admins-seulement/collect/collecte-des-propositions-pour-conquerir-le-monde',
        operationName: 'ProposalListViewRefetchQuery',
      })

      cy.get('.alert-dismissible').should('be.visible')
      cy.contains('only-visible-by-administrators').should('be.visible')
    })

    it('can access draft project', () => {
      Base.visit({
        path: '/project/project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement/collect/collecte-des-propositions-pour-la-capcobeer',
        operationName: 'ProposalListViewRefetchQuery',
      })

      cy.get('.alert-dismissible').should('be.visible')
      cy.contains('global.draft.only_visible_by_you').should('be.visible')
    })

    it('can access user-specific project', () => {
      Base.visit({
        path: '/project/project-pour-la-force-visible-par-mauriau-seulement/collect/collecte-des-propositions-pour-la-force',
        operationName: 'ProposalListViewRefetchQuery',
      })
      cy.get('.alert-dismissible').should('be.visible')
      cy.contains('global.draft.only_visible_by_you').should('be.visible')
    })

    it('can access custom access project', () => {
      Base.visit({
        path: '/project/un-avenir-meilleur-pour-les-nains-de-jardins-custom-access/collect/collecte-des-propositions-liberer-les-nains-de-jardin',
        operationName: 'ProposalListViewRefetchQuery',
      })
      cy.contains('Un avenir meilleur pour les nains de jardins (custom access)', { timeout: 10000 }).should(
        'be.visible',
      )
    })
  })

  describe('when admin accesses admin-only project', () => {
    it('displays project correctly', () => {
      cy.directLoginAs('admin')
      Base.visit({
        path: '/project/qui-doit-conquerir-le-monde-visible-par-les-admins-seulement/collect/collecte-des-propositions-pour-conquerir-le-monde',
        operationName: 'ProposalListViewRefetchQuery',
      })

      cy.contains('only-visible-by-administrators', { timeout: 5000 }).should('be.visible')
    })
  })

  describe('when admin accesses own project', () => {
    before(() => {
      cy.task('db:restore')
      cy.directLoginAs('admin')
    })
    it('displays project and allows editing', () => {
      Base.visit({
        path: '/project/project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement/collect/collecte-des-propositions-pour-la-capcobeer',
        operationName: 'ProposalListViewRefetchQuery',
      })

      cy.get('#authors-credit').should('contain.text', 'admin')
      cy.contains('global.draft.only_visible_by_you', { timeout: 3000 }).should('be.visible')
      cy.contains('action_edit').click({ force: true })
      cy.url().should('include', '/admin-next/project')
    })
  })

  describe('when pierre accesses restricted project', () => {
    before(() => {
      cy.task('enable:feature', 'projects_form')
    })

    it('can view project and restricted access modal', () => {
      cy.directLoginAs('pierre')
      Base.visit({
        path: '/project/un-avenir-meilleur-pour-les-nains-de-jardins-custom-access/collect/collecte-des-propositions-liberer-les-nains-de-jardin',
        operationName: 'ProposalListViewRefetchQuery',
      })

      cy.contains('Un avenir meilleur pour les nains de jardins (custom access)').should('be.visible')
      cy.contains('restrictedaccess').should('be.visible')

      cy.get('#restricted-access').click({ force: true })

      cy.contains('people-with-access-to-project').should('be.visible')
      cy.contains('Agent de la ville').should('be.visible')
      cy.contains('Utilisateurs').should('be.visible')
      cy.contains('global.close').should('be.visible')

      cy.contains('Utilisateurs').click({ force: true })
      cy.get('.cap-modal__body')
      cy.get('#R3JvdXA6Z3JvdXAz-modal .cap-modal__body').should('not.contain.text', 'ptondereau')
    })
  })

  describe('when viewing project trash', () => {
    before(() => {
      cy.task('enable:feature', 'project_trash')
    })

    it('displays trashed opinions', () => {
      cy.directLoginAs('admin')
      Base.visit({
        path: '/project/strategie-technologique-de-letat-et-services-publics',
        operationName: 'OpinionListQuery',
      })
      cy.contains('project.show.trashed.short_name')
    })
  })

  describe('when admin deletes a proposal', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.task('enable:feature', 'project_trash')
      cy.directLoginAs('admin')
    })

    it('removes proposal from list after deletion', () => {
      Base.visit({
        path: '/project/projet-avec-beaucoup-dopinions/collect/collecte-des-propositions-avec-questions-qui-va-etre-jetee',
        operationName: 'ProposalListViewRefetchQuery',
      })
      cy.get('.proposal-preview-list').should('be.visible')
      cy.contains('Proposition qui va être').should('be.visible')

      cy.interceptGraphQLOperation({ operationName: 'ProposalAdminPageQuery' })
      cy.visit('/admin/capco/app/proposal/proposal105/edit')
      cy.wait('@ProposalAdminPageQuery', { timeout: 10000 })

      cy.get('#proposal-admin-page-tabs-tab-6').click({ force: true })

      cy.get('#proposal-trashed-tab').click({ force: true })
      cy.get('[name="trashedReason"]').type('Pas intéressant désolé')

      cy.interceptGraphQLOperation({ operationName: 'ChangeProposalPublicationStatusMutation' })
      cy.get('[id="proposal-change-state"]').click({ force: true })
      cy.wait('@ChangeProposalPublicationStatusMutation', { timeout: 10000 })

      cy.contains('global.saved', { timeout: 5000 }).should('be.visible')

      Base.visit({
        path: '/project/projet-avec-beaucoup-dopinions/collect/collecte-des-propositions-avec-questions-qui-va-etre-jetee',
        operationName: 'ProposalListViewRefetchQuery',
        withIntercept: false,
      })
      cy.contains('Proposition qui va être jetée').should('not.exist')
    })
  })

  describe('when evaluating proposal analysis immediately', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('spyl')
      cy.task('enable:feature', 'analytics_page')
    })

    it('allows decision and displays official answer', () => {
      Base.visit({
        path: '/admin/capco/app/proposalform/proposalformIdf/edit',
        operationName: 'ProposalFormAdminPageQuery',
      })

      cy.interceptGraphQLOperation({ operationName: 'ProposalFormAdminAnalysisConfigurationFormQuery' })
      cy.get('#link-tab-new-analysis').click({ force: true })
      cy.wait('@ProposalFormAdminAnalysisConfigurationFormQuery', { timeout: 10000 })

      cy.get('#step_now').click({ force: true })

      cy.interceptGraphQLOperation({ operationName: 'UpdateProposalFormAnalysisConfigurationMutation' })
      cy.get('#analysis-configuration-submit').click({ force: true })
      cy.wait('@UpdateProposalFormAnalysisConfigurationMutation', { timeout: 10000 })

      Base.visit({
        path: '/project/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-projet-local-en-tant-quassociation-avec-siret',
        operationName: 'NavBarMenuQuery',
      })
      cy.get('#proposal_analysis_decision').should('be.visible')
      cy.get('.proposal__last__news__title').should('not.exist')

      cy.interceptGraphQLOperation({ operationName: 'ChangeProposalDecisionMutation' })
      cy.get('.edit-analysis-icon').click({ force: true })
      cy.wait('@ChangeProposalDecisionMutation', { timeout: 10000 })

      cy.get('#validate-proposal-decision-button').click({ force: true })
      cy.get('.saving').should('be.visible')
      cy.get('.saved').should('exist')

      Base.reload({ operationName: 'NavBarMenuQuery' })
      cy.get('#proposal_analysis_decision').should('be.visible')
      cy.get('.proposal__last__news__title').should('be.visible')
      cy.get('.proposal__last__news__title').should('contain.text', 'card.title.official.answer')
    })
  })

  describe('when assessing proposal analysis immediately', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('spyl')
    })

    it('allows assessment and displays favorable status', () => {
      Base.visit({
        path: '/admin/capco/app/proposalform/proposalformIdf/edit',
        operationName: 'ProposalFormAdminPageQuery',
      })

      cy.interceptGraphQLOperation({ operationName: 'ProposalFormAdminAnalysisConfigurationFormQuery' })
      cy.get('#link-tab-new-analysis').click({ force: true })
      cy.wait('@ProposalFormAdminAnalysisConfigurationFormQuery', { timeout: 10000 })

      cy.get('#step_now').click({ force: true })

      cy.interceptGraphQLOperation({ operationName: 'UpdateProposalFormAnalysisConfigurationMutation' })
      cy.get('#analysis-configuration-submit').click({ force: true })
      cy.wait('@UpdateProposalFormAnalysisConfigurationMutation', { timeout: 10000 })

      Base.visit({
        path: '/project/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-projet-local-en-tant-quorganisme-public',
        operationName: 'NavBarMenuQuery',
      })
      cy.get('#proposal_analysis_assessment').should('be.visible')

      cy.interceptGraphQLOperation({ operationName: 'ChangeProposalAssessmentMutation' })
      cy.get('.edit-analysis-icon').click({ force: true })
      cy.wait('@ChangeProposalAssessmentMutation', { timeout: 10000 })

      cy.get('.jodit-wysiwyg').type("J'apprécie a moitié garçon")
      cy.get('#label-radio-status-FAVOURABLE').click({ force: true })

      cy.get('#validate-proposal-assessment-button').click({ force: true })
      cy.wait('@ChangeProposalAssessmentMutation', { timeout: 10000 })

      cy.get('#confirm-assessment-button').click({ force: true })
      cy.get('.saving').should('be.visible')
      cy.get('.saved').should('exist')

      Base.reload({ operationName: 'NavBarMenuQuery' })
      cy.get('#proposal_analysis_assessment').should('be.visible')
      cy.get('#proposal_analysis_assessment').should('contain.text', 'global.favorable')
    })
  })

  describe('when analysing proposal immediately', () => {
    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('agui')
    })

    it('allows analysis and displays favorable status', () => {
      Base.visit({
        path: '/project/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-projet-local-en-tant-quorganisme-public',
        operationName: 'NavBarMenuQuery',
      })
      cy.get('#proposal_analysis_analyses').should('be.visible')

      cy.get('.edit-analysis-icon').click({ force: true })
      cy.get('#proposal-analysis-form-responses10').clear().type('42')
      cy.get('#proposal-analysis-form-responses11').clear().type('12')
      cy.get('#label-radio-status-FAVOURABLE').click({ force: true })

      cy.interceptGraphQLOperation({ operationName: 'AnalyseProposalAnalysisMutation' })
      cy.get('#validate-proposal-analysis-button').click({ force: true })
      cy.wait('@AnalyseProposalAnalysisMutation')

      Base.reload({ operationName: 'NavBarMenuQuery' })
      cy.get('#proposal_analysis_analyses').should('be.visible')
      cy.get('#proposal_analysis_analyses').should('contain.text', 'global.favorable')
    })
  })

  describe('when not logged in', () => {
    beforeEach(() => {
      cy.task('db:restore')
    })

    it('does not show analysis panel', () => {
      Base.visit({
        path: '/project/budget-participatif-rennes/collect/collecte-des-propositions/proposals/test-de-publication-avec-accuse-de-reception',
        operationName: 'NavbarRightQuery',
      })

      cy.get('#proposal_analysis_panel').should('not.exist')
    })
  })
})

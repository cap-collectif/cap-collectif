import { Base, ProposalPage } from '~e2e-pages/index'
import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

const ADMIN_ONLY_PROJECT = {
  project: 'qui-doit-conquerir-le-monde-visible-par-les-admins-seulement',
  step: 'collecte-des-propositions-pour-conquerir-le-monde',
}
const DRAFT_PROJECT = {
  project: 'project-pour-la-creation-de-la-capcobeer-visible-par-admin-seulement',
  step: 'collecte-des-propositions-pour-la-capcobeer',
}
const USER_SPECIFIC_PROJECT = {
  project: 'project-pour-la-force-visible-par-mauriau-seulement',
  step: 'collecte-des-propositions-pour-la-force',
}
const CUSTOM_ACCESS_PROJECT = {
  project: 'un-avenir-meilleur-pour-les-nains-de-jardins-custom-access',
  step: 'collecte-des-propositions-liberer-les-nains-de-jardin',
}

describe('Project', () => {
  before(() => {
    cy.task('db:restore')
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Read-only listing synchronized with its GraphQL query.
   */
  describe('when filtering projects with theme page', () => {
    setupFeatureFlags({ themes: true, projects_form: true })

    it('displays filtered project cards', () => {
      // Scoped to this test: the theme page throws a non-blocking client error.
      cy.on('uncaught:exception', () => false)
      Base.visit({ path: '/themes/immobilier', operationName: 'ProjectsListQuery' })
      cy.get('.cap-project-card').should('have.length', 7)
    })
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Read-only page synchronized with its GraphQL query.
   */
  describe('when viewing presentation step', () => {
    setupFeatureFlags({ blog: true })

    it('displays correct number of news items', () => {
      Base.visit({
        path: '/project/croissance-innovation-disruption/presentation/presentation-1',
        operationName: 'PresentationStepPageQuery',
      })
      cy.get('.media--news').should('have.length', 2)
    })
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Read-only page synchronized with its GraphQL query.
   */
  describe('when viewing project posts menu', () => {
    setupFeatureFlags({ blog: true })

    it('displays correct number of posts', () => {
      Base.visit({
        path: '/project/croissance-innovation-disruption',
        operationName: 'NavbarRightQuery',
      })

      cy.get('#presentationStep-pstep1 .excerpt').contains('5')
    })
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Read-only page synchronized with its GraphQL query.
   */
  describe('when viewing project header', () => {
    it('displays correct number of votes', () => {
      Base.visit({
        path: '/project/croissance-innovation-disruption/consultation/collecte-des-avis',
        operationName: 'OpinionListQuery',
      })

      cy.get('#votes-counter-pill').should('contain.text', '10')
    })
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Read-only pages synchronized with their GraphQL queries.
   */
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

  /**
   * @cypress-status compliant
   * @cypress-reason Read-only page synchronized with its GraphQL query.
   */
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

  /**
   * @cypress-status compliant
   * @cypress-reason Checks how Symfony denies access to collect steps.
   */
  describe('when viewer cannot access the project', () => {
    const visitDeniedStep = ({ project, step }: { project: string; step: string }) => {
      cy.visit(`/project/${project}/collect/${step}`, { failOnStatusCode: false })
    }

    it('opens login modal for anonymous user on private project', () => {
      visitDeniedStep(ADMIN_ONLY_PROJECT)

      cy.get('[role="dialog"][aria-label="login.with"]').should('be.visible')
      cy.get('#confirm-login').should('be.visible')
      cy.get('.cap-proposal-card').should('not.exist')
    })

    it('opens login modal for anonymous user on restricted project', () => {
      visitDeniedStep(CUSTOM_ACCESS_PROJECT)

      cy.get('[role="dialog"][aria-label="login.with"]').should('be.visible')
      cy.get('.cap-proposal-card').should('not.exist')
    })

    it('displays unauthorized message and allows reporting on private project', () => {
      cy.directLoginAs('user')
      visitDeniedStep(ADMIN_ONLY_PROJECT)

      cy.contains('unauthorized-access').should('be.visible')
      cy.get('.cap-proposal-card').should('not.exist')
      cy.contains('a', 'error.report').should('be.visible').click()
      cy.url().should('include', '/contact')
    })

    it('displays unauthorized message on restricted project', () => {
      cy.directLoginAs('user')
      visitDeniedStep(CUSTOM_ACCESS_PROJECT)

      cy.contains('unauthorized-access').should('be.visible')
      cy.contains('a', 'back-to-homepage').should('be.visible').its('0.pathname').should('eq', '/')
    })
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Checks the not-found page rendered for an unknown project slug.
   */
  describe('when accessing wrong project URL', () => {
    it('displays 404 error', () => {
      cy.visit(
        '/project/qui-doit-conquerir-fautedefrappe-visible-par-les-admins-seulement-seulement/collect/collecte-des-propositions-pour-conquerir-le-monde',
        { failOnStatusCode: false },
      )

      cy.contains('error.404.title').should('be.visible')
      cy.get('.cap-proposal-card').should('not.exist')
    })
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Read-only vote step pages synchronized with their GraphQL queries.
   */
  describe('when super admin accesses private projects', () => {
    setupFeatureFlags({ projects_form: true, new_new_vote_step: true })

    beforeEach(() => {
      cy.directLoginAs('super_admin')
    })

    it('can access admin-only project', () => {
      ProposalPage.visitCollectStepPage(ADMIN_ONLY_PROJECT)

      cy.contains('Qui doit conquérir le monde ? | Visible par les admins seulement').should('be.visible')
      cy.contains('only-visible-by-administrators').should('be.visible')
      cy.get('.cap-proposal-card').should('exist')
    })

    it('can access draft project', () => {
      ProposalPage.visitCollectStepPage(DRAFT_PROJECT)

      cy.contains('global.draft.only_visible_by_you').should('be.visible')
      cy.get('#restricted-access').should('be.visible').and('contain.text', 'restrictedaccess')
    })

    it('can access user-specific project', () => {
      ProposalPage.visitCollectStepPage(USER_SPECIFIC_PROJECT)

      cy.contains('Project pour La Force').should('be.visible')
      cy.get('.cap-proposal-card').should('exist')
    })

    it('can access custom access project', () => {
      ProposalPage.visitCollectStepPage(CUSTOM_ACCESS_PROJECT)

      cy.contains('Un avenir meilleur pour les nains de jardins (custom access)').should('be.visible')
    })
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Read-only vote step page synchronized with its GraphQL queries.
   */
  describe('when admin accesses admin-only project', () => {
    setupFeatureFlags({ new_new_vote_step: true })

    it('displays project correctly', () => {
      cy.directLoginAs('admin')
      ProposalPage.visitCollectStepPage(ADMIN_ONLY_PROJECT)

      cy.contains('Qui doit conquérir le monde ? | Visible par les admins seulement').should('be.visible')
      cy.contains('only-visible-by-administrators').should('be.visible')
      cy.get('.cap-proposal-card').should('exist')
    })
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Read-only vote step page synchronized with its GraphQL queries.
   */
  describe('when admin accesses own project', () => {
    setupFeatureFlags({ new_new_vote_step: true })

    beforeEach(() => {
      cy.directLoginAs('admin')
    })

    it('displays project and allows editing', () => {
      ProposalPage.visitCollectStepPage(DRAFT_PROJECT)

      cy.get('#authors-credit').should('be.visible').and('contain.text', 'admin')
      cy.contains('global.draft.only_visible_by_you').should('be.visible')
      cy.get('#action_show').should('be.visible').and('contain.text', 'action_edit').click()
      cy.url().should('include', '/admin-next/project')
    })
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Read-only vote step page synchronized with its GraphQL queries.
   */
  describe('when pierre accesses restricted project', () => {
    setupFeatureFlags({ projects_form: true, new_new_vote_step: true })

    it('can view project and restricted access modal', () => {
      cy.directLoginAs('pierre')
      ProposalPage.visitCollectStepPage(CUSTOM_ACCESS_PROJECT)

      cy.contains('Un avenir meilleur pour les nains de jardins (custom access)').should('be.visible')
      cy.get('#restricted-access').should('be.visible').and('contain.text', 'restrictedaccess').click()

      cy.get('[role="dialog"][aria-label="groups-with-access-to-project"]')
        .should('be.visible')
        .within(() => {
          cy.contains('people-with-access-to-project').should('be.visible')
          cy.contains('button', 'Agent de la ville').should('be.visible')
          cy.contains('button', 'global.close').should('be.visible')
          cy.contains('button', 'Utilisateurs').should('be.visible').click()
        })

      cy.get('[role="dialog"][aria-label="people-with-access-to-project"]')
        .should('be.visible')
        .and('contain.text', 'Utilisateurs')
        .and('contain.text', 'sfavot')
        .and('not.contain.text', 'ptondereau')
    })
  })

  /**
   * @cypress-status compliant
   * @cypress-reason Read-only page synchronized with its GraphQL query.
   */
  describe('when viewing project trash', () => {
    setupFeatureFlags({ project_trash: true })

    it('displays trashed opinions', () => {
      cy.directLoginAs('admin')
      Base.visit({
        path: '/project/strategie-technologique-de-letat-et-services-publics',
        operationName: 'OpinionListQuery',
      })
      cy.contains('project.show.trashed.short_name')
    })
  })

  /**
   * @cypress-status legacy
   * @cypress-reason Trashes the proposal through the legacy Sonata proposal admin page with forced clicks
   * and silences a known application exception.
   */
  describe('when admin deletes a proposal', () => {
    setupFeatureFlags({ project_trash: true, new_new_vote_step: true })

    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('admin')
    })

    it('removes proposal from list after deletion', () => {
      // Scoped to this test: known client error on the legacy proposal admin page.
      cy.on('uncaught:exception', err => !err.message.includes("reading 'kK'"))

      const trashedProposalStep = {
        project: 'projet-avec-beaucoup-dopinions',
        step: 'collecte-des-propositions-avec-questions-qui-va-etre-jetee',
      }

      ProposalPage.visitCollectStepPage(trashedProposalStep)
      cy.get('.cap-proposal-card').should('be.visible')
      cy.contains('Proposition qui va être').should('be.visible')

      cy.interceptGraphQLOperation({ operationName: 'ProposalAdminPageQuery' })
      cy.visit('/admin/capco/app/proposal/proposal105/edit')
      cy.wait('@ProposalAdminPageQuery')

      cy.get('#proposal-admin-page-tabs-tab-6').click({ force: true })

      cy.get('#proposal-trashed-tab').click({ force: true })
      cy.get('[name="trashedReason"]').type('Pas intéressant désolé')

      cy.interceptGraphQLOperation({ operationName: 'ChangeProposalPublicationStatusMutation' })
      cy.get('[id="proposal-change-state"]').click({ force: true })
      cy.wait('@ChangeProposalPublicationStatusMutation')

      cy.contains('global.saved').should('be.visible')

      ProposalPage.visitCollectStepPage(trashedProposalStep)
      cy.contains('Proposition qui va être jetée').should('not.exist')
    })
  })

  /**
   * @cypress-status legacy
   * @cypress-reason Configures the analysis through the legacy Sonata proposal form admin page and uses
   * forced clicks without visibility assertions on the proposal page.
   */
  describe('when evaluating proposal analysis immediately', () => {
    setupFeatureFlags({ analytics_page: true })

    beforeEach(() => {
      cy.task('db:restore')
      cy.directLoginAs('spyl')
    })

    it('allows decision and displays official answer', () => {
      Base.visit({
        path: '/admin/capco/app/proposalform/proposalformIdf/edit',
        operationName: 'ProposalFormAdminPageQuery',
      })

      cy.interceptGraphQLOperation({ operationName: 'ProposalFormAdminAnalysisConfigurationFormQuery' })
      cy.get('#link-tab-new-analysis').click({ force: true })
      cy.wait('@ProposalFormAdminAnalysisConfigurationFormQuery')

      cy.get('#step_now').click({ force: true })

      cy.interceptGraphQLOperation({ operationName: 'UpdateProposalFormAnalysisConfigurationMutation' })
      cy.get('#analysis-configuration-submit').click({ force: true })
      cy.wait('@UpdateProposalFormAnalysisConfigurationMutation')

      Base.visit({
        path: '/project/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-projet-local-en-tant-quassociation-avec-siret',
        operationName: 'NavBarMenuQuery',
      })
      cy.get('#proposal_analysis_decision').should('be.visible')
      cy.get('.proposal__last__news__title').should('not.exist')

      cy.interceptGraphQLOperation({ operationName: 'ChangeProposalDecisionMutation' })
      cy.get('.edit-analysis-icon').click({ force: true })
      cy.wait('@ChangeProposalDecisionMutation')

      cy.get('#validate-proposal-decision-button').click({ force: true })
      cy.get('.saving').should('be.visible')
      cy.get('.saved').should('exist')

      Base.reload({ operationName: 'NavBarMenuQuery' })
      cy.get('#proposal_analysis_decision').should('be.visible')
      cy.get('.proposal__last__news__title').should('be.visible')
      cy.get('.proposal__last__news__title').should('contain.text', 'card.title.official.answer')
    })
  })

  /**
   * @cypress-status legacy
   * @cypress-reason Configures the analysis through the legacy Sonata proposal form admin page and uses
   * forced clicks without visibility assertions on the proposal page.
   */
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
      cy.wait('@ProposalFormAdminAnalysisConfigurationFormQuery')

      cy.get('#step_now').click({ force: true })

      cy.interceptGraphQLOperation({ operationName: 'UpdateProposalFormAnalysisConfigurationMutation' })
      cy.get('#analysis-configuration-submit').click({ force: true })
      cy.wait('@UpdateProposalFormAnalysisConfigurationMutation')

      Base.visit({
        path: '/project/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-projet-local-en-tant-quorganisme-public',
        operationName: 'NavBarMenuQuery',
      })
      cy.get('#proposal_analysis_assessment').should('be.visible')

      cy.interceptGraphQLOperation({ operationName: 'ChangeProposalAssessmentMutation' })
      cy.get('.edit-analysis-icon').click({ force: true })
      cy.wait('@ChangeProposalAssessmentMutation')

      cy.get('.jodit-wysiwyg').type("J'apprécie a moitié garçon")
      cy.get('#label-radio-status-FAVOURABLE').click({ force: true })

      cy.get('#validate-proposal-assessment-button').click({ force: true })
      cy.wait('@ChangeProposalAssessmentMutation')

      cy.get('#confirm-assessment-button').click({ force: true })
      cy.get('.saving').should('be.visible')
      cy.get('.saved').should('exist')

      Base.reload({ operationName: 'NavBarMenuQuery' })
      cy.get('#proposal_analysis_assessment').should('be.visible')
      cy.get('#proposal_analysis_assessment').should('contain.text', 'global.favorable')
    })
  })

  /**
   * @cypress-status non-compliant
   * @cypress-reason Uses forced clicks without visibility assertions on the proposal page.
   */
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

  /**
   * @cypress-status compliant
   * @cypress-reason Read-only proposal page synchronized with its GraphQL query.
   */
  describe('when not logged in', () => {
    it('does not show analysis panel', () => {
      Base.visit({
        path: '/project/budget-participatif-rennes/collect/collecte-des-propositions/proposals/test-de-publication-avec-accuse-de-reception',
        operationName: 'NavbarRightQuery',
      })

      cy.get('#proposal_analysis_panel').should('not.exist')
    })
  })
})

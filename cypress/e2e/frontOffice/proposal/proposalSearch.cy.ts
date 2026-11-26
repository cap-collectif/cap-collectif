import { Base, ProposalPage } from '~e2e-pages/index'
import { setupFeatureFlags } from '../../../support/setupFeatureFlags'

const collectStep = {
  project: 'budget-participatif-rennes',
  step: 'collecte-des-propositions',
}

const proposalCards = () => cy.get('.proposal-preview')

const selectFilter = (filter: string, value: string) => {
  cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
  cy.get(`#proposal-filter-${filter}-button`).click()
  cy.get(`#proposal-filter-${filter} button[value="${value}"]`).click()
  cy.wait('@ProposalStepPageQuery')
}

const selectOrder = (value: string) => {
  cy.interceptGraphQLOperation({ operationName: 'ProposalStepPageQuery' })
  cy.get('#proposal-filter-sorting-button').click()
  cy.get(`#proposal-filter-sorting button[value="${value}"]`).click()
  cy.wait('@ProposalStepPageQuery')
}

const searchProposals = (terms: string) => {
  cy.get('#proposal-search-input').type(terms)
}

const visitVoteStep = (path: string) => {
  cy.interceptGraphQLOperation({ operationName: 'VoteStepQuery' })
  cy.interceptGraphQLOperation({ operationName: 'useVoteStepFilters_Query' })
  cy.visit(path)
  cy.wait('@VoteStepQuery', { timeout: 15000 })
  cy.wait('@useVoteStepFilters_Query', { timeout: 15000 })
}

const openFilters = () => {
  cy.contains('button', 'btn_filter').click()
  cy.get('#modal-section-contributors').should('be.visible')
}

const applyFilters = () => {
  cy.interceptGraphQLOperation({ operationName: 'VoteStepQuery' })
  cy.getByDataCy('apply-vote-step-filters').should('be.visible').click()
  cy.wait('@VoteStepQuery', { timeout: 15000 })
}

const selectVoteStepFilter = (filter: string, value: string) => {
  cy.get(`#modal-section-contributors #accordion-button-${filter}`).should('be.visible').click()
  cy.get(`#modal-section-contributors label[for="${value}"]`).should('be.visible').click()
  cy.get(`#modal-section-contributors input[value="${value}"]`).should('be.checked')
}

describe('Proposal search and filters', () => {
  setupFeatureFlags({ new_vote_step: false, new_new_vote_step: false })

  beforeEach(() => {
    cy.task('db:restore')
  })

  it('initializes proposal filters from URL parameters', () => {
    cy.setFeatureFlags({ user_type: true, districts: true })
    cy.directLoginAs('admin')
    ProposalPage.visitLegacyStepPage({
      project: 'budget-participatif-idf',
      step: 'collecte-des-projets-idf-privee?category=pCategoryIdf1&district=RGlzdHJpY3Q6ZGlzdHJpY3RJZGYy&status=statusIdfCollect1&type=VXNlclR5cGU6NA==',
    })

    cy.get('#proposal-filter-categories-button').should('contain.text', 'Espaces verts et biodiversité')
    cy.get('#proposal-filter-districts-button').should('contain.text', 'Val de marne (94)')
    cy.get('#proposal-filter-statuses-button').should('contain.text', 'Nouveau projet')
    cy.get('#proposal-filter-types-button').should('contain.text', 'Institution')
    proposalCards().should('have.length', 0)
  })

  it('filters collect-step proposals by theme, status and contributor type', () => {
    cy.setFeatureFlags({ themes: true, districts: true, user_type: true })
    ProposalPage.visitLegacyStepPage(collectStep)

    proposalCards().should('have.length', 8)

    selectFilter('themes', 'theme2')
    proposalCards().should('have.length', 5)

    selectFilter('statuses', 'status2')
    proposalCards().should('have.length', 0)

    selectFilter('statuses', 'status1')
    proposalCards().should('have.length', 4)

    selectFilter('types', 'VXNlclR5cGU6MQ==')
    proposalCards().should('have.length', 4)

    selectFilter('types', 'VXNlclR5cGU6NA==')
    proposalCards().should('have.length', 0)
  })

  it('restricts private collect-step proposals to eligible visitors', () => {
    Base.visit({
      path: '/project/budget-participatif-rennes/collect/collecte-des-propositions-privee',
      operationName: 'ProposalListViewRefetchQuery',
      failOnStatusCode: false,
    })
    proposalCards().should('have.length', 0)

    cy.directLoginAs('user')
    ProposalPage.visitLegacyStepPage({
      project: 'budget-participatif-rennes',
      step: 'collecte-des-propositions-privee',
    })
    proposalCards().should('have.length', 2)
  })

  it('enforces access to private proposals', () => {
    cy.visit(
      '/projects/budget-participatif-rennes/collect/collecte-des-propositions-privee/proposals/proposition-plus-votable-1',
      {
        failOnStatusCode: false,
      },
    )
    cy.contains('unauthorized-access').should('be.visible')

    cy.directLoginAs('user')
    cy.visit(
      '/projects/budget-participatif-rennes/collect/collecte-des-propositions-privee/proposals/proposition-plus-votable-1',
      {
        failOnStatusCode: false,
      },
    )
    cy.contains('unauthorized-access').should('not.exist')

    cy.directLoginAs('admin')
    cy.visit(
      '/projects/budget-participatif-rennes/collect/collecte-des-propositions-privee/proposals/proposition-plus-votable-1',
      { failOnStatusCode: false },
    )
    cy.contains('unauthorized-access').should('not.exist')
  })

  it('keeps unanalysed private proposals restricted to eligible roles', () => {
    const privateProposalPath =
      '/projects/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-projet-qui-ne-sera-pas-analyse'

    cy.visit(privateProposalPath, { failOnStatusCode: false })
    cy.contains('unauthorized-access').should('be.visible')

    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit(
      '/projects/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-projet-local-en-tant-quentreprise',
      { failOnStatusCode: false },
    )
    cy.contains('unauthorized-access').should('not.exist')

    cy.directLoginAs('user')
    cy.visit(privateProposalPath, { failOnStatusCode: false })
    cy.contains('unauthorized-access').should('be.visible')

    cy.directLoginAs('project_owner')
    cy.visit(privateProposalPath, { failOnStatusCode: false })
    cy.contains('unauthorized-access').should('be.visible')

    cy.directLoginAs('admin')
    cy.visit(privateProposalPath, { failOnStatusCode: false })
    cy.contains('unauthorized-access').should('not.exist')
  })

  it('allows a project administrator to view their private proposal', () => {
    cy.directLoginAs('project_owner')
    cy.visit('/projects/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-grand-projet', {
      failOnStatusCode: false,
    })

    cy.contains('unauthorized-access').should('not.exist')
  })

  it('sorts and searches collect-step proposals', () => {
    ProposalPage.visitLegacyStepPage(collectStep)

    cy.get('#proposal-filter-sorting-button').should('have.attr', 'aria-label', 'global.filter_f_random')

    selectOrder('last')
    proposalCards()
      .eq(0)
      .invoke('text')
      .should('match', /Test de publication avec\s*accusé de réception/)
    proposalCards().eq(1).should('contain.text', 'Proposition plus votable')

    selectOrder('comments')
    proposalCards()
      .eq(0)
      .invoke('text')
      .should('match', /Ravalement de la façade\s*de la bibliothèque\s*municipale/)
    proposalCards()
      .eq(1)
      .invoke('text')
      .should('match', /Test de publication avec\s*accusé de réception/)

    searchProposals('proposition')
    proposalCards().should('have.length', 2)
    cy.contains('.proposal-preview', /Proposition pas encore\s*votable/).should('be.visible')
    cy.contains('.proposal-preview', 'Proposition plus votable').should('be.visible')
  })

  it('searches collect-step proposals by reference and reports empty results', () => {
    ProposalPage.visitLegacyStepPage(collectStep)

    searchProposals('1-7')
    proposalCards().should('have.length', 1)
    cy.get('.proposal-preview a[href*="proposition-pas-encore-votable"]').should('exist')

    cy.get('#proposal-search-input').clear()
    cy.get('#proposal-search-input').type('toto')
    proposalCards().should('have.length', 0)
    cy.contains('proposal.empty').should('be.visible')
  })

  it('combines proposal filters, search and sorting', () => {
    cy.setFeatureFlags({ themes: true })
    cy.directLoginAs('user')
    ProposalPage.visitLegacyStepPage(collectStep)

    selectFilter('themes', 'theme2')
    selectOrder('comments')
    searchProposals('proposition')

    proposalCards().should('have.length', 2)
    proposalCards().eq(0).should('contain.text', 'Proposition plus votable')
    proposalCards()
      .eq(1)
      .invoke('text')
      .should('match', /Proposition pas encore\s*votable/)
  })

  it('filters and sorts selection-step proposals', () => {
    cy.setFeatureFlags({ themes: true })
    ProposalPage.visitLegacyStepPage({
      kind: 'selection',
      project: 'budget-participatif-rennes',
      step: 'selection',
    })

    proposalCards().should('have.length', 3)
    selectFilter('themes', 'theme2')
    proposalCards().should('have.length', 2)

    selectOrder('last')
    proposalCards()
      .eq(0)
      .invoke('text')
      .should('match', /Installation de bancs sur\s*la place de la mairie/)

    selectOrder('comments')
    proposalCards()
      .eq(0)
      .invoke('text')
      .should('match', /Ravalement de la façade\s*de la bibliothèque\s*municipale/)
  })
})

describe('Proposal step search and filters', () => {
  setupFeatureFlags({ new_vote_step: true, new_new_vote_step: true })

  beforeEach(() => {
    cy.viewport(1600, 1000)
    cy.task('db:restore')
  })

  it('initializes filters from URL parameters', () => {
    cy.setFeatureFlags({ districts: true, user_type: true })
    cy.directLoginAs('admin')

    const institutionUserTypeId = 'VXNlclR5cGU6NA=='
    visitVoteStep(
      `/project/budget-participatif-idf/collect/collecte-des-projets-idf-privee?category=pCategoryIdf1&status=statusIdfCollect1&userType=${institutionUserTypeId}`,
    )

    openFilters()

    cy.get('#modal-section-contributors').within(() => {
      cy.get('input[name="category"][value="pCategoryIdf1"]').should('be.checked')
      cy.get('input[name="status"][value="statusIdfCollect1"]').should('be.checked')
      cy.get(`input[name="contributors"][value="${institutionUserTypeId}"]`).should('be.checked')
    })
    cy.get('.cap-proposal-card').should('have.length', 0)
  })

  it('filters collect step proposals by theme, status, contributor and term', () => {
    cy.setFeatureFlags({ themes: true, districts: true, user_type: true })

    visitVoteStep('/project/budget-participatif-rennes/collect/collecte-des-propositions')
    cy.get('.cap-proposal-card').should('have.length', 8)

    openFilters()
    selectVoteStepFilter('theme', 'theme2')
    applyFilters()
    cy.get('.cap-proposal-card').should('have.length', 5)

    visitVoteStep('/project/budget-participatif-rennes/collect/collecte-des-propositions')
    openFilters()
    selectVoteStepFilter('status', 'status2')
    applyFilters()
    cy.get('.cap-proposal-card').should('have.length', 2)

    visitVoteStep('/project/budget-participatif-rennes/collect/collecte-des-propositions')
    openFilters()
    selectVoteStepFilter('userType', 'VXNlclR5cGU6NA==')
    applyFilters()
    cy.get('.cap-proposal-card').should('have.length', 0)

    visitVoteStep('/project/budget-participatif-rennes/collect/collecte-des-propositions')
    cy.interceptGraphQLOperation({ operationName: 'VoteStepQuery' })
    cy.get('#search-vote-step').type('proposition')
    cy.wait('@VoteStepQuery', { timeout: 15000 })

    cy.get('.cap-proposal-card').should('have.length', 2)
    cy.contains('Proposition pas encore votable').should('be.visible')
    cy.contains('Proposition plus votable').should('be.visible')
  })
})

type NeededInfos = 'summary' | 'description' | 'illustration' | 'theme' | 'category' | 'address' | 'districts'

type AdvancedVoteConfig = {
  budget?: {
    max: string
  }
  threshold?: {
    threshold: string
    archivingTime: string
    archivingUnit: 'global.days' | 'global.months'
  }
  limit?: {
    min: string
    max: string
  }
  voteHelpText?: string
}

type ProposalConfig = {
  addNews?: boolean
  visibility?: 'public' | 'global-restricted'
  sort?: string
  defaultStatus?: string
}

type MapConfig = {
  address: string
  zoomLevel: string
}

type View = 'map' | 'list' | 'grid'

type Publication = 'published' | 'draft'

export default new (class AdminCollectStepPage {
  get cy() {
    return cy
  }

  visitCollectPage(operationType: 'EDIT' | 'CREATE' = 'EDIT') {
    const url = `/admin-next/project/UHJvamVjdDpwcm9qZWN0QW5hbHlzZQ==/update-step/collect-step/Q29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXAxMw==?operationType=${operationType}`
    cy.visit(url)
    cy.interceptGraphQLOperation({ operationName: 'CollectStepFormQuery' })
  }

  save() {
    cy.interceptGraphQLOperation({ operationName: 'UpdateProposalFormMutation' })
    cy.interceptGraphQLOperation({ operationName: 'UpdateCollectStepMutation' })
    this.getSaveButton().click()
    cy.wait('@UpdateProposalFormMutation')
    cy.wait('@UpdateCollectStepMutation')
    cy.contains('admin.update.successful')
  }

  fillLabel(text: string) {
    return cy.get('#label').clear().type(text)
  }

  fillDescription(text: string) {
    return cy.get('.jodit-wysiwyg').clear().type(text)
  }

  openProposalFormAccordion() {
    return cy.get('#accordion-button-proposal-form').click({ force: true })
  }
  fillProposalFormDescription(text: string) {
    return cy
      .get('#form_tab #form\\.description-JoditTextArea-fr_fr > div > div > div.jodit-workplace > div.jodit-wysiwyg')
      .click({ force: true })
      .type(text)
  }

  addProposalFormNeededInfos(label: `proposal_form.${NeededInfos}`) {
    cy.get('#add-needed-infos').click({ force: true })
    cy.contains(label).click()
  }

  editNeededInfos(label: NeededInfos) {
    return cy.get(`.NeededInfo_${label}_edit`).click()
  }

  addCategory() {
    cy.get('.NeededInfo_categories_item_add').click()
    cy.get('#categoryName').type('new category')
    // need to fix feature toggle toggling in env test https://github.com/cap-collectif/platform/issues/16732
    // cy.get('[color="#3f51b5"]').click()
    // cy.get('#GRAPH').click()
    cy.get('#add-category-button').click()
  }

  addDistrict() {
    cy.get('#add-district-button').click()
    cy.get('#name').type('new district')
    cy.contains('display.on.map').click()
    cy.get('#border_color_enabled').click({ force: true })
    cy.get('#background_color_enabled').click({ force: true })
    cy.contains('global.validate').click()
  }

  openVotesAccordion() {
    return cy.get('#accordion-button-vote-capitalize').click({ force: true })
  }

  selectAdvancedTab() {
    return cy.contains('global.advanced.text').click({ force: true })
  }

  configAdvancedVotes(config: AdvancedVoteConfig) {
    if (config.budget) {
      cy.get('#budget_switch').click({ force: true })
      cy.get('#budget').type(config.budget.max)
    }
    if (config.threshold) {
      cy.get('#votesMin_switch').click({ force: true })
      cy.get('#voteThreshold').type(config.threshold.threshold)
      cy.get('#proposalArchivedTime').type(config.threshold.archivingTime)
      cy.get('#proposalArchivedUnitTime').type(`${config.threshold.archivingUnit}{enter}`)
    }
    if (config.limit) {
      cy.get('#votesMin-votesLimit_switch').click({ force: true })
      // need to fix feature toggle toggling in env test https://github.com/cap-collectif/platform/issues/16732
      // cy.get('#votesMin').type(config.limit.min)
      cy.get('#votesLimit').type(config.limit.max)
      cy.contains('activate-vote-ranking').click()
    }
  }

  openStatusAccordion() {
    return cy.get('#accordion-button-status\\.plural').click()
  }

  addStatus() {
    return cy.get('#add-status-button').click()
  }

  fillStatus(index: string, status: string) {
    return cy.getByDataCy(`statuses_${index}_name`).type(status)
  }

  openProposalConfigAccordion() {
    return cy.get('#accordion-button-admin\\.fields\\.proposal\\.group_content').click()
  }

  configProposal(config: ProposalConfig) {
    if ('addNews' in config) {
      const label = cy.contains('admin.allow.proposal.news')
      cy.get('#allowAuthorsToAddNews')
        .as('checkbox')
        .invoke('is', ':checked')
        .then(checked => {
          if (checked && config.addNews === true) return
          if (!checked && config.addNews === false) return
          if (checked === true && config.addNews === false) {
            label.click()
          }
          if (checked === false && config.addNews === true) {
            label.click()
          }
        })
    }
    if (config.visibility) {
      const selector =
        config.visibility === 'public' ? 'public - (everybody)' : 'global-restricted - (authors-and-administrators)'
      cy.contains(selector).click()
    }
    if (config.sort) {
      cy.get('#defaultSort').type(`${config.sort}{enter}`)
    }
    if (config.defaultStatus) {
      cy.get('#defaultStatus').type(`${config.defaultStatus}{enter}`)
    }
  }

  openOptionnalSettingsAccordion() {
    return cy.get('#accordion-button-optional-settings').click()
  }

  checkListView() {
    cy.get('#form\\.isListViewEnabled').check({ force: true })
  }
  checkGridView() {
    cy.get('#form\\.isGridViewEnabled').check({ force: true })
  }
  checkMapView() {
    cy.get('#form\\.isMapViewEnabled').check({ force: true })
  }

  fillMapInfos(config: MapConfig) {
    const { address, zoomLevel } = config
    cy.getByDataCy('map_address').type(address)
    cy.get('#zoomMap').type(`${zoomLevel}{enter}`)
  }

  selectDefaultView(view: View) {
    const selector: Record<View, string> = {
      map: '#mainView_choice-MAP',
      grid: '#mainView_choice-GRID',
      list: '#mainView_choice-LIST',
    }

    return cy.get(selector[view]).check({ force: true })
  }

  fillMetaDescription(metaDescription: string) {
    return cy.get('#metaDescription').type(metaDescription)
  }

  fillCustomCode(customCode: string) {
    return cy.get('#customCode').click({ force: true }).type(customCode)
  }

  checkCanContact(value: boolean) {
    const checkbox = cy.getByDataCy('canContact')
    if (value) {
      checkbox.check({ force: true })
    } else {
      checkbox.uncheck({ force: true })
    }
  }

  selectPublication(publication: Publication) {
    const selector: Record<Publication, string> = {
      published: '#enabled_choice-PUBLISHED',
      draft: '#enabled_choice-DRAFT',
    }

    return cy.get(selector[publication]).check({ force: true })
  }

  getSaveButton() {
    return cy.get('#save-collect-step')
  }
})()

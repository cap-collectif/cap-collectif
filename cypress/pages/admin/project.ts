export default new (class AdminProjectPage {
  get cy() {
    return cy
  }

  path(projectName: string) {
    return `admin/alpha/project/${projectName}/edit`
  }

  proposalsTabPath(projectName: string) {
    return `admin/alpha/project/${projectName}/contributions/proposals?state=ALL`
  }

  visitAnalysisTabPath(projectName: string, parameters?: { [key: string]: string }) {
    this.cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectAdminPageQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectAdminAnalysisTabQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectAdminContributionsPageQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectAdminParticipantTabQuery' })

    let url = `admin/alpha/project/${projectName}/analysis`

    if (parameters) {
      const queryParameters = Object.keys(parameters)
        .map(key => `${key}=${parameters[key]}`)
        .join('&')

      url += `?${queryParameters}`
    }

    this.cy.visit(url)
  }

  assertProposalsAndProgressStatusLengthOnAnalysisTab(expectedProgressStatus: string, expectedLength: number) {
    this.cy.get('div.pickableList-row').should('have.length', expectedLength)
    this.cy.get('button.analysis-status-container span').should('have.length', expectedLength)
    for (let i = 0; i < expectedLength; i++) {
      this.cy
        .get(`div:nth-child(${i + 1}) > div > div > button span.ml-5`)
        .contains(expectedProgressStatus)
        .should('exist')
    }
  }

  visit(projectName: string) {
    cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectAdminPageQuery' })
    cy.interceptGraphQLOperation({ operationName: 'UpdateProjectAlphaMutation' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectAdminAnalysisTabQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectAdminContributionsPageQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectAdminParticipantTabQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectTypeListFieldQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectMetadataAdminFormThemeQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectMetadataAdminFormDistrictQuery' })
    cy.interceptGraphQLOperation({ operationName: 'ProjectAdminCollectStepFormProposalsQuery' })

    this.cy.visit(this.path(projectName))

    cy.wait('@AdminRightNavbarAppQuery')
    cy.wait('@ProjectAdminPageQuery')
    cy.wait('@ProjectAdminAnalysisTabQuery')
    cy.wait('@ProjectAdminContributionsPageQuery')
    cy.wait('@ProjectAdminParticipantTabQuery')
    cy.wait('@ProjectTypeListFieldQuery')
    cy.wait('@ProjectMetadataAdminFormThemeQuery')
    cy.wait('@ProjectMetadataAdminFormDistrictQuery')
  }

  visitContributionsPage({ projectSlug, state, stepId }: { projectSlug: string; state: string; stepId: string }) {
    this.cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectAdminPageQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectAdminAnalysisTabQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectAdminContributionsPageQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectAdminParticipantTabQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectAdminProposalsPageQuery' })

    this.cy.visit(`admin/alpha/project/${projectSlug}/contributions/proposals?state=${state}&step=${stepId}`)

    this.cy.wait('@AdminRightNavbarAppQuery')
    this.cy.wait('@ProjectAdminPageQuery')
    this.cy.wait('@ProjectAdminParticipantTabQuery')
    this.cy.wait('@ProjectAdminProposalsPageQuery')
    this.cy.wait('@ProjectAdminContributionsPageQuery')
    this.cy.wait('@ProjectAdminAnalysisTabQuery')
    this.cy.wait('@ProjectAdminProposalsPageQuery')
  }

  visitProposalsTab(projectName: string) {
    this.cy.interceptGraphQLOperation({ operationName: 'AdminRightNavbarAppQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectAdminPageQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectAdminAnalysisTabQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectAdminContributionsPageQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectAdminParticipantTabQuery' })
    this.cy.interceptGraphQLOperation({ operationName: 'ProjectAdminProposalsPageQuery' })

    this.cy.visit(this.proposalsTabPath(projectName))

    this.cy.wait('@AdminRightNavbarAppQuery')
    this.cy.wait('@ProjectAdminPageQuery')
    this.cy.wait('@ProjectAdminParticipantTabQuery')
    this.cy.wait('@ProjectAdminContributionsPageQuery')
    this.cy.wait('@ProjectAdminProposalsPageQuery')
    this.cy.wait('@ProjectAdminProposalsPageQuery')
  }

  openAddModal() {
    this.addButton.click()
  }

  get sortSelect() {
    return this.cy.get('#argument_sort_label')
  }

  get mostMessageReceivedFilter() {
    return this.cy.contains('filter.messages_received.most')
  }

  get leastMessageReceivedFilter() {
    return this.cy.contains('filter.messages_received.least')
  }

  get firstNumberOfMessagesSentToAuthor() {
    return this.cy.get('span[title="proposal_stats_messages_received"]').first()
  }

  get stepFilterSelect() {
    return this.cy.get('#admin_label_step')
  }

  selectCollectStep(stepName: string) {
    this.stepFilterSelect.click()
    this.cy.get('span').contains(stepName).click()
  }

  get addButton() {
    return this.cy.contains('global.add')
  }

  get collectStepSelector() {
    return this.cy.get('#collect_step')
  }

  get selectionStepSelector() {
    return this.cy.get('#selection_step')
  }

  toggleVote() {
    this.cy.get("label[for='step-votable'] span.circle-toggler").click()
  }

  toggleSecretBallot() {
    this.cy.get("label[for='step-secretBallot'] span.circle-toggler").click()
  }

  get questionnaireSelector() {
    return this.cy.contains('global.questionnaire')
  }

  fillStepInputs(title: string, label: string) {
    this.stepTitleInput.type(title)
    this.stepLabelInput.type(label)
  }

  get stepLabelInput() {
    return this.cy.get('#step-label')
  }

  get stepTitleInput() {
    return this.cy.get('#step-title')
  }

  submitStepModal() {
    this.stepModalSubmitButton.click()
  }

  get stepModalSubmitButton() {
    return this.cy.get('#step-modal-submit')
  }

  checkStepListLength(expectedLength: number) {
    this.stepList.should('have.length', expectedLength)
  }

  get stepList() {
    return this.cy.get('.list-group > div > div')
  }

  save() {
    this.saveButton.click()
  }

  get saveButton() {
    return this.cy.contains('global.save')
  }

  get selectAllRows() {
    return this.cy.get('#allRows')
  }

  get mergeButton() {
    return this.cy.get('#merge-button')
  }

  get mergeTitleInput() {
    return this.cy.get(`input[id="merge.title"]`)
  }

  get mergeBodyInput() {
    return this.cy.get(`div[class="jodit-wysiwyg"]`)
  }

  get mergeModal() {
    return this.cy.get('.modal-dialog')
  }

  viewMergeModal() {
    this.mergeModal.should('be.visible')
  }

  get contributionList() {
    return this.cy.get('.pickableList-row')
  }

  mergeRows() {
    this.contributionList.should('not.contain', 'badge.merged')
    this.selectAllRows.click()
    this.mergeButton.click()
    this.viewMergeModal()
    this.mergeTitleInput.click().type('Merged title')
    this.mergeBodyInput.type('Merged body')
    this.save()
  }
})()

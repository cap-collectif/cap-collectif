type SectionData = {
  title?: string
  description?: string
  contribuable?: boolean
  versionable?: boolean
  sourceable?: boolean
  subtitle?: string
  filter?: string
  helpText?: string
}

type ConsutlationData = {
  title: string
  description?: string
}

export default new (class AdminConsultationPage {
  get cy() {
    return cy
  }

  visitConsultationPage(operationType: 'EDIT' | 'CREATE' = 'EDIT') {
    const url = `/admin-next/project/UHJvamVjdDpwcm9qZWN0MQ==/update-step/consultation-step/Q29uc3VsdGF0aW9uU3RlcDpjc3RlcDE=?operationType=${operationType}`
    cy.visit(url)
    cy.interceptGraphQLOperation({ operationName: 'ConsultationStepFormQuery' })
  }

  save() {
    cy.interceptGraphQLOperation({ operationName: 'CreateOrUpdateConsultationMutation' })
    cy.interceptGraphQLOperation({ operationName: 'UpdateConsultationStepMutation' })
    this.getSaveButton().click()
    cy.wait('@CreateOrUpdateConsultationMutation')
    cy.wait('@UpdateConsultationStepMutation')
  }

  fillLabel(text: string) {
    return cy.get('#label').clear().type(text)
  }

  fillDescription(text: string) {
    return cy.get('#label').clear().type(text)
  }

  addSection(consultationIndex = 0) {
    return cy.getByDataCy(`consultations.${consultationIndex}-append-section-button`).click()
  }

  getSectionsList(consultationIndex = 0, type: 'MODEL' | 'NEW' | 'EDIT' = 'EDIT') {
    let selector = ''
    if (['NEW', 'MODEL'].includes(type)) {
      selector += `[aria-labelledby=${type}-${consultationIndex}] `
    }

    selector += `[data-rbd-droppable-id="consultations.${consultationIndex}.sections"]`
    return cy.get(selector)
  }

  getSectionItem(consultationIndex: number, sectionIndex: number) {
    return cy.getByDataCy(`consultations.${consultationIndex}.sections.${sectionIndex}-section-item`)
  }

  getSectionTitle(consultationIndex: number, sectionIndex: number) {
    return cy.getByDataCy(`consultations.${consultationIndex}.sections.${sectionIndex}-section-title`)
  }

  getSectionEditButton(consultationIndex: number, sectionIndex: number) {
    return cy.getByDataCy(`consultations.${consultationIndex}.sections.${sectionIndex}-edit-button`)
  }

  editSection(consultationIndex: number, sectionIndex: number, data: SectionData) {
    const { title, description, contribuable, versionable, sourceable, subtitle, helpText, filter } = data
    this.getSectionEditButton(consultationIndex, sectionIndex).click()

    if (title) {
      cy.get(`[name="consultations.${consultationIndex}.sections.${sectionIndex}.title"]`).clear().type(title)
    }

    if (description) {
      cy.get('.cap-modal__body .jodit-wysiwyg').type(description)
    }

    cy.contains('global.next').click()

    const checkboxesSettings = [
      { name: 'contribuable', value: contribuable },
      { name: 'versionable', value: versionable },
      { name: 'sourceable', value: sourceable },
    ].filter(({ value }) => {
      return value !== undefined
    })

    checkboxesSettings.forEach(({ name, value }) => {
      const checkbox = cy.get(`[name="consultations.${consultationIndex}.sections.${sectionIndex}.${name}"]`)
      if (value) {
        checkbox.check({ force: true })
      } else {
        checkbox.uncheck({ force: true })
      }
    })

    const editSectionButton = cy.get('#confirm-edit-section')
    if (!subtitle && !helpText && !filter) {
      return editSectionButton.click({ force: true })
    }

    cy.contains('optional-settings').click()

    if (subtitle) {
      cy.get(`[name="consultations.${consultationIndex}.sections.${sectionIndex}.subtitle"]`).clear().type(subtitle)
    }

    if (filter) {
      cy.get('#optional-settings .cap-select').click()
      cy.contains(filter).click({ force: true })
    }

    if (helpText) {
      cy.get(`[name="consultations.${consultationIndex}.sections.${sectionIndex}.votesHelpText"]`)
        .clear()
        .type(helpText)
    }

    return editSectionButton.click({ force: true })
  }

  getRemoveConsultationButton() {
    return cy.get('#remove-consultion-button')
  }

  getSaveButton() {
    return cy.get('#save-consultation')
  }

  getAppendConsultationButton() {
    return cy.get('#append-consultation-button')
  }

  getConsultationList() {
    return cy.get('#consultations-list').children()
  }

  fillConsultation(consultationIndex: number, data: ConsutlationData) {
    const { title, description } = data
    cy.get(`[name="consultations.${consultationIndex}.title"]`).type(title)

    if (description) {
      cy.get(`[name="consultations.${consultationIndex}.description"]`).type(description)
    }
  }

  fillModel(consultationIndex: number, consultationTitle: string) {
    cy.contains('from_model').click()
    cy.get(`[id="consultations.${consultationIndex}.model"] .cap-select__input-container`)
      .click()
      .type(consultationTitle)
    cy.get('body').type('{enter}')
  }

  getAppendSectionButton(consultationIndex: number, type: 'MODEL' | 'NEW' = 'MODEL') {
    return cy.get(
      `[aria-labelledby="${type}-${consultationIndex}"] [data-cy="consultations.${consultationIndex}-append-section-button"]`,
    )
  }

  getSectionDeleteButton(consultationIndex: number, sectionIndex: number, type: 'MODEL' | 'NEW' = 'MODEL') {
    return cy.get(
      `[aria-labelledby="${type}-${consultationIndex}"] [data-cy="consultations.${consultationIndex}.sections.${sectionIndex}-delete-button"]`,
    )
  }

  openConsultationsAccordion() {
    cy.get('#accordion-button-consultations').click({ force: true })
  }
})()

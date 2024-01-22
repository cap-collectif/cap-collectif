type FormType = 'QUESTIONNAIRE' | 'PROPOSAL_FORM' | 'CONSULTATION' | 'QUESTIONNAIRE_ANALYSIS'
export default new (class AdminFormListPage {
  get cy() {
    return cy
  }

  get path() {
    return '/admin-next/forms'
  }

  visit(formType: FormType) {
    return this.cy.visit(`${this.path}?formType=${formType}`)
  }

  createForm(formType: FormType, title: string) {
    const config: Record<FormType, { choice: string; mutation: string }> = {
      QUESTIONNAIRE: {
        choice: 'global.questionnaire',
        mutation: 'CreateQuestionnaireMutation',
      },
      QUESTIONNAIRE_ANALYSIS: {
        choice: 'proposal_form.admin.evaluation',
        mutation: 'CreateQuestionnaireMutation',
      },
      CONSULTATION: {
        choice: 'global.consultation',
        mutation: 'CreateConsultationMutation',
      },
      PROPOSAL_FORM: {
        choice: 'admin.fields.proposal.form',
        mutation: 'CreateProposalFormMutation',
      },
    }

    const { choice } = config[formType]
    const { mutation } = config[formType]

    cy.interceptGraphQLOperation({ operationName: mutation })

    cy.getByDataCy('create-form-button').click()
    cy.getByDataCy('create-form-modal-title').type(title)
    cy.get('.cap-select__control').click().type(choice).type('{enter}')
    cy.getByDataCy('create-form-modal-create-button').click()
    cy.wait(`@${mutation}`)
  }
})()

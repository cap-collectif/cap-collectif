describe('Proposal form administration', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })

  it('saves notification settings', () => {
    cy.interceptGraphQLOperation({ operationName: 'UpdateProposalFormNotificationsConfigurationMutation' })
    cy.visit('/admin/capco/app/proposalform/proposalFormVote/edit')

    cy.get('#link-tab-notification').click()
    cy.get('#proposal_form_notification_on_update').uncheck({ force: true })
    cy.get('#proposal_form_notification_comment_on_create').uncheck({ force: true })
    cy.get('#notification-submit').click()
    cy.wait('@UpdateProposalFormNotificationsConfigurationMutation')
    cy.get('#proposal_form_notification_on_update').check({ force: true }).should('be.checked')
    cy.get('#proposal_form_notification_comment_on_create').check({ force: true }).should('be.checked')
    cy.get('#notification-submit').click()

    cy.wait('@UpdateProposalFormNotificationsConfigurationMutation')
    cy.contains('global.saved').should('be.visible')

    cy.reload()
    cy.get('#link-tab-notification').click()
    cy.get('#proposal_form_notification_on_update').should('be.checked')
    cy.get('#proposal_form_notification_comment_on_create').should('be.checked')
  })

  it('saves proposal form settings', () => {
    cy.interceptGraphQLOperation({ operationName: 'ChangeProposalFormParametersMutation' })
    cy.visit('/admin/capco/app/proposalform/proposalFormVote/edit')

    cy.get('#link-tab-settings').click()
    cy.get('#global\\.title').clear().type('Updated proposal form title')
    cy.get('#proposal_form_costable').check({ force: true })
    cy.get('#parameters-submit').click()

    cy.wait('@ChangeProposalFormParametersMutation')
    cy.contains('global.saved').should('be.visible')

    cy.get('#link-tab-notification').click()
    cy.get('#link-tab-settings').click()
    cy.get('#global\\.title').should('have.value', 'Updated proposal form title')
    cy.get('#proposal_form_costable').should('be.checked')
  })

  it('saves proposal form content fields', () => {
    cy.interceptGraphQLOperation({ operationName: 'UpdateProposalFormMutation' })
    cy.visit('/admin/capco/app/proposalform/proposalFormVote/edit')

    cy.get('#proposal_form_using_summary_field').check({ force: true })
    cy.get('#proposal_form_using_illustration_field').check({ force: true })
    cy.get('#proposal_form_description').clear().type('Proposal form introduction')
    cy.get('#proposal_form_title_help_text').clear().type('Proposal title help')
    cy.get('#proposal_form_summary_help_text').clear().type('Proposal summary help')
    cy.get('#proposal_form_description_help_text').clear().type('Proposal description help')
    cy.get('#proposal_form_illustration_help_text').clear().type('Proposal illustration help')
    cy.get('#proposal_form_category_help_text').clear().type('Proposal category help')
    cy.get('#proposal_form_category_mandatory').check({ force: true })
    cy.get('#proposal_form_using_address_field').check({ force: true })
    cy.get('#proposal_form_address_help_text').clear().type('Proposal address help')

    cy.get('#proposal-form-admin-content-save').click()
    cy.wait('@UpdateProposalFormMutation')
    cy.contains('global.saved').should('be.visible')

    cy.reload()
    cy.get('#proposal_form_using_summary_field').should('be.checked')
    cy.get('#proposal_form_using_illustration_field').should('be.checked')
    cy.get('#proposal_form_description .jodit-wysiwyg').should('contain', 'Proposal form introduction')
    cy.get('#proposal_form_title_help_text').should('have.value', 'Proposal title help')
    cy.get('#proposal_form_summary_help_text').should('have.value', 'Proposal summary help')
    cy.get('#proposal_form_description_help_text').should('have.value', 'Proposal description help')
    cy.get('#proposal_form_illustration_help_text').should('have.value', 'Proposal illustration help')
    cy.get('#proposal_form_category_help_text').should('have.value', 'Proposal category help')
    cy.get('#proposal_form_category_mandatory').should('be.checked')
    cy.get('#proposal_form_using_address_field').should('be.checked')
    cy.get('#proposal_form_address_help_text').should('have.value', 'Proposal address help')
  })

  it('creates categories and structured questions in a proposal form', () => {
    cy.interceptGraphQLOperation({ operationName: 'UpdateProposalFormMutation' })
    cy.visit('/admin/capco/app/proposalform/proposalFormVote/edit')

    cy.contains('.form-group', 'proposal_form.admin.configuration.categories_list')
      .contains('button', 'global.add')
      .click()
    cy.get('[id="categories[0].name"]').type('Cypress category')
    cy.get('#ProposalFormAdminCategoriesStepModal-submit').click()

    cy.get('#perso-field-add').click()
    cy.get('.create-question').click()
    cy.get('[id="questions[0].title"]').type('Cypress media question')
    cy.get('[id="questions[0].helpText"]').type('Cypress media help')
    cy.get('[id="questions[0].type"]').select('medias')
    cy.get('[id="questions[0].required"]').check({ force: true })
    cy.get('[id="questions[0].submit"]').click()

    cy.get('#perso-field-add').click()
    cy.get('.create-section').click()
    cy.get('[id="questions[1].title"]').type('Cypress section')
    cy.get('[id="questions[1].description"] .jodit-wysiwyg').type('Cypress section description')
    cy.get('[id="questions[1].submit"]').click()

    cy.get('#perso-field-add').click()
    cy.get('.create-sub-section').click()
    cy.get('[id="questions[2].title"]').type('Cypress sub-section')
    cy.get('[id="questions[2].description"] .jodit-wysiwyg').type('Cypress sub-section description')
    cy.get('[id="questions[2].submit"]').click()

    cy.get('#perso-field-add').click()
    cy.get('.create-question').click()
    cy.get('[id="questions[3].title"]').type('Cypress range question')
    cy.get('[id="questions[3].helpText"]').type('Cypress range help')
    cy.get('[id="questions[3].type"]').select('number')
    cy.get('#proposal-form-admin-configuration_isRangeBetween').check({ force: true })
    cy.get('[name="questions[3].rangeMin"]').type('1000')
    cy.get('[name="questions[3].rangeMax"]').type('10')
    cy.contains('error.min-higher-maximum').should('be.visible')
    cy.get('[name="questions[3].rangeMin"]').clear().type('0')
    cy.get('[name="questions[3].rangeMax"]').clear().type('0')
    cy.contains('error.define-value').should('be.visible')
    cy.get('[name="questions[3].rangeMax"]').clear().type('1000').blur()
    cy.get('[name="questions[3].rangeMin"]').clear().type('100').blur()
    cy.get('[id="questions[3].submit"]').click()

    cy.get('#proposal-form-admin-content-save').click()
    cy.wait('@UpdateProposalFormMutation')
    cy.contains('global.saved').should('be.visible')

    cy.reload()
    cy.contains('Cypress category').should('be.visible')
    cy.contains('Cypress media question').should('be.visible')
    cy.contains('Cypress section').should('be.visible')
    cy.contains('Cypress sub-section').should('be.visible')
    cy.contains('Cypress range question').should('be.visible')

    cy.get('#js-btn-edit-0').click()
    cy.get('[id="questions[0].helpText"]').should('have.value', 'Cypress media help')
    cy.get('[id="questions[0].required"]').should('be.checked')
    cy.get('[id="questions[0].cancel"]').click()

    cy.get('#js-btn-edit-1').click()
    cy.get('[id="questions[1].description"] .jodit-wysiwyg').should('contain', 'Cypress section description')
    cy.get('[id="questions[1].cancel"]').click()

    cy.get('#js-btn-edit-2').click()
    cy.get('[id="questions[2].description"] .jodit-wysiwyg').should('contain', 'Cypress sub-section description')
    cy.get('[id="questions[2].cancel"]').click()

    cy.get('#js-btn-edit-3').click()
    cy.get('[name="questions[3].rangeMin"]').should('exist')
    cy.get('[name="questions[3].rangeMax"]').should('exist')
    cy.get('[id="questions[3].helpText"]').should('have.value', 'Cypress range help')
    cy.get('[id="questions[3].cancel"]').click()
  })

  it('deletes the first question from an unattached form', () => {
    cy.interceptGraphQLOperation({ operationName: 'UpdateProposalFormMutation' })
    cy.visit('/admin/capco/app/proposalform/proposalform13/edit')

    cy.get('[id^="js-btn-trash-"]').then($questions => {
      const questionCount = $questions.length
      cy.get('#js-btn-trash-0').click()
      cy.get('#js-delete-question').click()
      cy.get('#proposal-form-admin-content-save').click()

      cy.wait('@UpdateProposalFormMutation')
      cy.get('[id^="js-btn-trash-"]').should('have.length', questionCount - 1)
      cy.reload()
      cy.get('[id^="js-btn-trash-"]').should('have.length', questionCount - 1)
    })
  })
})

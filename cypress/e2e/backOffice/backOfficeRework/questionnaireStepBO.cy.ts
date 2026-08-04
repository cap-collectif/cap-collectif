import { AdminQuestionnaireStepPage } from '~e2e/pages'

describe('Questionnaire Step back office', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.task('enable:feature', 'unstable__new_create_project')
    cy.task('disable:feature', 'helpscout_beacon')
    cy.directLoginAs('super_admin')
  })

  it('should update the questionnaire title and description', () => {
    AdminQuestionnaireStepPage.visitQuestionnaireStepPage()
    AdminQuestionnaireStepPage.fillLabel('Updated questionnaire title')
    cy.get('#questionnaire\\.description').clear().type('Updated questionnaire description')
    AdminQuestionnaireStepPage.addAShortAnswerQuestion('short title', 'short desc')
    AdminQuestionnaireStepPage.addAButtonsQuestion('short title', 'short desc')
    AdminQuestionnaireStepPage.openOptionnalSettingsAccordion()
    AdminQuestionnaireStepPage.fillMetaDescription('Meta description')
    AdminQuestionnaireStepPage.fillCustomCode('Custom code')
    AdminQuestionnaireStepPage.save()
      .its('request.body.variables.input.title')
      .should('eq', 'Updated questionnaire title')

    AdminQuestionnaireStepPage.visitQuestionnaireStepPage()
    cy.get('#label').should('have.value', 'Updated questionnaire title')
    cy.get('#questionnaire\\.description').should('have.value', 'Updated questionnaire description')
  })
  it('should be possible to add a conditional jump and a redirection on a big questionnaire', () => {
    AdminQuestionnaireStepPage.visitQuestionnaireStepPageWithJumps()
    cy.getByDataCy('questionnaire-conditional-jump').then($conditionalJumps => {
      const initialConditionalJumpCount = $conditionalJumps.length
      cy.get('body').then($body => {
        const initialRedirectionCount = $body.find('[data-cy="questionnaire-redirection"]').length
        AdminQuestionnaireStepPage.addAJump()
        AdminQuestionnaireStepPage.addARedirection()
        AdminQuestionnaireStepPage.save()

        AdminQuestionnaireStepPage.visitQuestionnaireStepPageWithJumps()
        cy.getByDataCy('questionnaire-conditional-jump').should('have.length', initialConditionalJumpCount + 1)
        cy.getByDataCy('questionnaire-redirection').should('have.length', initialRedirectionCount + 1)
      })
    })
  })

  it('should include VOTING questionnaire in model list', () => {
    cy.task('run:sql', 'UPDATE questionnaire SET type = "VOTING"')
    cy.visit(
      'admin-next/project/UHJvamVjdDpwcm9qZWN0V2l0aEFub255bW91c1F1ZXN0aW9ubmFpcmU=/update-step/questionnaire-step/qStepProjectAnonymousQuestionnaire?operationType=CREATE',
    )
    AdminQuestionnaireStepPage.getFromModelTab().click({ force: true })
    AdminQuestionnaireStepPage.getFromModelTabListInput().click({ force: true })
    cy.contains('Votre avis sur les JO 2024 à Paris')
  })

  it('edits a question and discards unsaved question changes', () => {
    AdminQuestionnaireStepPage.visitQuestionnaireStepPage()
    AdminQuestionnaireStepPage.editQuestion(0)
    cy.get('#temporaryQuestion\\.title').clear().type('Persisted question title')
    cy.get('#temporaryQuestion\\.description-JoditTextArea-fr_fr .jodit-wysiwyg')
      .clear()
      .type('Persisted question description')
    cy.get('#temporaryQuestion\\.helpText').clear().type('Persisted question help')
    cy.getByDataCy('last-step').click()
    cy.get('#temporaryQuestion\\.required').check({ force: true })
    cy.getByDataCy('finish-question').click()
    AdminQuestionnaireStepPage.save()

    AdminQuestionnaireStepPage.visitQuestionnaireStepPage()
    cy.contains('Persisted question title').should('be.visible')
    AdminQuestionnaireStepPage.editQuestion(0)
    cy.get('#temporaryQuestion\\.description-JoditTextArea-fr_fr .jodit-wysiwyg').should(
      'contain',
      'Persisted question description',
    )
    cy.get('#temporaryQuestion\\.helpText').should('have.value', 'Persisted question help')
    cy.getByDataCy('last-step').click()
    cy.get('#temporaryQuestion\\.required').should('be.checked')
    cy.get('button:visible').contains('global.back').click()
    cy.get('#temporaryQuestion\\.title').clear().type('Discarded question title')
    cy.contains('button', 'cancel').click()
    cy.contains('Persisted question title').should('be.visible')
    cy.contains('Discarded question title').should('not.exist')
  })
})

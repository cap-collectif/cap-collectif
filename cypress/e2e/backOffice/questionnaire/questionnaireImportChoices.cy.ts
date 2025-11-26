describe('Admin Questionnaire - Import Choices', () => {
  beforeEach(() => {
    cy.task('db:restore')
    cy.directLoginAs('admin')
  })

  it('should import choices from CSV files when editing a questionnaire', () => {
    cy.interceptGraphQLOperation({ operationName: 'QuestionnaireAdminPageQuery' })
    // Go to the admin questionnaire edit page
    cy.visit('/admin/capco/app/questionnaire/questionnaireAdmin/edit')
    cy.get('#parameters-submit').should('exist')

    // Add a new question
    cy.get('#perso-field-add').click()
    cy.contains('question_modal.create.title').should('exist')
    cy.get('.create-question').click()
    cy.get('#proposal-form-admin-question-modal-title-lg').should('exist')

    // Fill in question title
    cy.get(`#${CSS.escape('questions[0].title')}`).type('Question title edited with test')
    cy.get(`#${CSS.escape('questions[0].type')}`).select('global.question.types.select')

    // Wait for choices panel to appear
    cy.get('#questions_choice_panel_personal').should('exist')

    // Import doublons.csv
    cy.get('#import_choices').click()
    cy.get('#import-file').should('exist')
    cy.get('input#csv-file_field').selectFile('fixtures/doublons.csv', { force: true })
    cy.contains('n-items-found').should('exist') // num: 18
    cy.contains('n-duplicate-answer-excluded').should('exist') // num: 15
    cy.wait(1000)

    // Import over_1500.csv
    cy.get('input#csv-file_field').selectFile('fixtures/over_1500.csv', { force: true })
    cy.contains('n-items-found').should('exist') // num: 1612
    cy.wait('@QuestionnaireAdminPageQuery', { timeout: 2000 })
    cy.get('#import-file').click()
    cy.contains('75015 - PARIS ANTENNE DEX GRAND SUD OUEST').should('exist')

    // Submit question
    cy.get(`[id='questions[0].submit']`).should('exist').click({ force: true })
    cy.contains('your-question-has-been-registered').should('exist')

    // Submit questionnaire
    cy.get(`[id='parameters-submit']`).contains('global.save').should('exist').and('be.visible').click({ force: true })
    cy.url().should('include', '/admin/capco/app/questionnaire/questionnaireAdmin/edit')
  })
})

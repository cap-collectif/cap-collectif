@admin @project
Feature: Projects features

@database
Scenario: Logged in admin wants to edit admin project
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/project12/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I fill in the following:
    | metaDescription    | Such meta      |
    | video    | https://www.youtube.com/watch?v=dQw4w9WgXcQ      |
  And I fill the "#districts" react element with child number 1
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page

@database
Scenario: Logged in super admin wants to restrict a project
  Given I am logged in as super admin
  Then I go to "/admin/alpha/project/project12/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I click the "#label-radio-project-visibility-CUSTOM" element
  And I fill the "#project-restrictedViewerGroups" react element with child number 1
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/project/projet-sans-etapes-participatives/presentation/presentation-3"
  And I wait "#restricted-access" to appear on current page

@database
Scenario: Logged in admin wants to add questionnaire step to a project
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/project4/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I click the "#js-btn-create-step" element
  And I click the "#create-step-list li:nth-child(6)" element
  And I wait "#contained-modal-title-lg" to appear on current page
  And I fill in the following:
    | step-label    | QuestionnaireStepLabel      |
    | step-title    | QuestionnaireStepTitle      |
    | step-body     | QuestionnaireStepBody       |
    | step-footer   | QuestionnaireStepFooter     |
  And I fill the "#step-questionnaire" react element with child number 1
  And I click the "#step-modal-submit" element
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/project/projet-vide/questionnaire/questionnairesteptitle"
  And I wait "#reply-form-container" to appear on current page
  Then I should see "QuestionnaireStepTitle"
  Then I should see "QuestionnaireStepBody"
  Then I should see "QuestionnaireStepFooter"

@database
Scenario: Logged in admin wants to add consultation step to a project
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/project4/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I click the "#js-btn-create-step" element
  And I click the "#create-step-list li:nth-child(5)" element
  And I wait "#contained-modal-title-lg" to appear on current page
  And I fill in the following:
    | step-label    | ConsultationStepLabel      |
    | step-title    | ConsultationStepTitle      |
    | step-body     | ConsultationStepBody       |
  And I fill the "#step-consultations" react element with child number 1
  And I click the "#step-modal-submit" element
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/project/projet-vide/consultation/consultationsteptitle"
  Then I should see "ConsultationStepBody" within 10 seconds

@database
Scenario: Logged in admin wants to add collect step to a project
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/project4/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I click the "#js-btn-create-step" element
  And I click the "#create-step-list li:nth-child(2)" element
  And I wait "#contained-modal-title-lg" to appear on current page
  And I fill in the following:
    | step-label    | CollectStepLabel      |
    | step-title    | CollectStepTitle      |
    | step-body     | CollectStepBody       |
  And I fill the "#step-proposalForm" react element with child number 1
  And I check element "GRID"
  And I click the "#step-modal-submit" element
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/project/projet-vide/collect/collectsteptitle"
  And I wait ".ProposalStepPage-rendered" to appear on current page
  Then I should see "CollectStepTitle"
  Then I should see "CollectStepBody"

@database
Scenario: Logged in admin wants to add a presentation step to a project
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/project4/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I click the "#js-btn-create-step" element
  And I click the "#create-step-list li:nth-child(1)" element
  And I wait "#contained-modal-title-lg" to appear on current page
  And I fill in the following:
    | step-label    | PresentationStepLabel      |
    | step-title    | PresentationStepTitle      |
    | step-body     | PresentationStepBody       |
  And I click the "#step-modal-submit" element
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/project/projet-vide/presentation/presentationsteptitle"
  And I wait "#details" to appear on current page
  Then I should see "PresentationStepTitle" within 10 seconds
  Then I should see "PresentationStepBody" within 10 seconds

@database
Scenario: Logged in admin wants to add a debate step to a project
  Given I am logged in as admin
  Given feature "unstable__debate" is enabled
  Then I go to "/admin/alpha/project/project4/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I click the "#js-btn-create-step" element
  And I click the "#create-step-list li:nth-child(4)" element
  And I wait "#contained-modal-title-lg" to appear on current page
  And I fill in the following:
    | step-label    | DebateStepLabel      |
    | step-question    | DebateStepQuestion      |
    | articles[0].url    | https://blabla.com      |
  And I click the "#step-modal-submit" element
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/project/projet-vide/debate/debatestepquestion"

@database
Scenario: Admin merges two proposals
  Given I am logged in as admin
  And I go to "/admin/alpha/project/projectIdf/participants"
  And I wait "#export-button" to appear on current page
  And I click on button "#export-button"
  # Only 1 export should be visible for other don't have participants
  And I should see 1 ".export-option" elements

@database
Scenario: Logged in admin wants to edit alpha project with a locale 
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/englishProject/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I fill in the following:
    | title    | English Project Edited      |
  And I fill the project authors field with name 'spyl'
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page

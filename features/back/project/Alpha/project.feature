@admin @project
Feature: Alpha Projects features

Scenario: Logged in admin wants to edit alpha admin project
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/project12/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I fill in the following:
    | metaDescription    | Such meta      |
    | video    | https://www.youtube.com/watch?v=dQw4w9WgXcQ      |
  And I click the "#districts .react-select__value-container .react-select__input input" element
  And I fill the "#districts" react element with child number 1
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/consultation/projet-sans-etapes-participatives/presentation/presentation-3"
  And I wait ".cap-marker-1" to appear on current page
  Then I should see "Centre ville"

Scenario: Logged in admin wants to add questionnaire step to a project
  Given I am logged in as admin
  Then I go to "/admin/alpha/project/project4/edit"
  And I wait "#projectAdminForm" to appear on current page
  And I click the "#js-btn-create-step" element
  And I click the "#js-btn-create-step + ul li:nth-child(7)" element
  And I wait "#contained-modal-title-lg" to appear on current page
  And I fill in the following:
    | step-label    | QuestionnaireStepLabel      |
    | step-title    | QuestionnaireStepTitle      |
    | step-body     | QuestionnaireStepBody       |
    | step-footer   | QuestionnaireStepFooter     |
  And I fill the date field in ".modal-content"
  And I click the "#step-questionnaire .react-select__value-container .react-select__input input" element
  And I fill the "#step-questionnaire" react element with child number 1
  And I click the "#step-modal-submit" element
  And I click the "#submit-project-content" element
  And I wait ".alert__form_succeeded-message" to appear on current page
  And I go to "/project/projet-vide/questionnaire/questionnairesteptitle"
  And I wait "#QuestionnaireStepTabs" to appear on current page
  Then I should see "QuestionnaireStepTitle"
  Then I should see "QuestionnaireStepBody"
  Then I should see "QuestionnaireStepFooter"
  Then I should see "QuestionnaireStepLabel"

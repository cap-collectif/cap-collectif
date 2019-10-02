@admin @questionnaire 
Feature: Questionnaire admin features

@database
Scenario: Logged in admin create questionnaire
  Given I am logged in as admin
  And I go to the admin questionnaire list page
  And I click on add questionnaire button
  And I fill in the following:
  | title | Questionnaire created with test |
  And I click on button "#type-questionnaire"
  Then I click on button "#confirm-questionnaire-create"
  Then I should be redirected to "/admin/capco/app/questionnaire/list"
  Then I should see "Questionnaire created with test"

@database
Scenario: Logged in admin edit questionnaire
  Given I am logged in as admin
  And I go to the admin questionnaire edit page with id questionnaire2
  And I fill in the following:
  | questionnaire_title | Questionnaire edited with test |
  | proposal_form_description | This is a questionnaire description edited with test |
  And I check "notify_response_create"
  And I check "notify_response_update"
  And I check "notify_response_delete"
  And I click on button "#parameters-submit"
  And I wait ".alert__form_succeeded-message" to appear on current page
  Then I should see "global.saved"
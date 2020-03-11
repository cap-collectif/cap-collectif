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
  Then I wait "Questionnaire created with test" to appear on current page in ".sonata-ba-list"

@database @rabbitmq
Scenario: Logged in admin edit questionnaire
  Given I am logged in as admin
  And I go to the admin questionnaire edit page with id questionnaire2
  And I fill in the following:
  | questionnaire_title | Questionnaire edited with test |
  | proposal_form_description | This is a questionnaire description edited with test |
  And I check element "notify_response_create"
  And I check element "notify_response_update"
  And I check element "notify_response_delete"
  And I click on button "#parameters-submit"
  And I wait ".alert__form_succeeded-message" to appear on current page
  Then I should see "global.saved"

@database @rabbitmq
Scenario: Logged in admin edit questionnaire section
  Given I am logged in as admin
  And I go to the admin questionnaire edit page with id questionnaire2
  And I click on button "#js-btn-edit-0"
  And I fill in the following:
    | questions[0].title | Question title edited with test |
    | questions[0].helpText | Question helpText edited with test |
    | questions[0].description | Question description edited with test |
  And I check element "questions[0].required"
  And I check element "questions[0].private"
  And I click on button "[id='questions[0].submit']"
  Then I should see "Question title edited with test"

@database @rabbitmq
Scenario: Logged in admin cancels edit questionnaire modal
  Given I am logged in as admin
  And I go to the admin questionnaire edit page with id questionnaire2
  And I click on button "#js-btn-edit-0"
  And I fill in the following:
    | questions[0].title | Question title edited with test |
  And I check element "questions[0].required"
  And I check element "questions[0].private"
  And I click on button "[id='questions[0].submit']"
  And I wait "#proposal-form-admin-question-modal-title-lg" to disappear on current page
  And I click on button "#js-btn-edit-0"
  And I fill in the following:
    | questions[0].title | Question title edited 2 |
  And I click on button "[id='questions[0].cancel']"
  Then I should see "Question title edited with test"

@database @rabbitmq
Scenario: Logged in admin adds a conditional jump on a question
  Given I am logged in as admin
  And I go to the admin questionnaire edit page with id questionnaire4
  And I click on button "#js-btn-edit-2"
  And I click on button "#add-conditional-jump-button"
  Then I should see "Au top"
  And I click on button "[id='questions[2].submit']"
  Then I wait "your-question-has-been-registered" to appear on current page in "body"
  And I wait "#proposal-form-admin-question-modal-title-lg" to disappear on current page
  And I click on button "#js-btn-edit-2"
  Then I should see "Au top"
  And I click on button "[id='questions[2].cancel']"
  And I wait "#proposal-form-admin-question-modal-title-lg" to disappear on current page
  And I click on button "[id='parameters-submit']"
  And I wait ".alert__form_succeeded-message" to appear on current page maximum "30"
  Then I should see "global.saved"

@database @rabbitmq @randomly-failing
Scenario: Logged in admin edit questionnaire, import choices
  Given I am logged in as admin
  And I go to the admin questionnaire edit page with id questionnaireAdmin
  Then I wait "#js-btn-create-question" to appear on current page
  And I click on button "#js-btn-create-question"
  And I wait "#proposal-form-admin-question-modal-title-lg" to appear on current page
  Then I fill in the following:
    | questions[0].title | Question title edited with test |
  And I select "global.question.types.select" from "questions[0].type"
  Then I wait "#questions_choice_panel_personal" to appear on current page
  And I click on button "#import_choices"
  Then I wait "#import-file" to appear on current page
  And I attach the file "/var/www/features/files/doublons.csv" to "csv-file_field"
  And I should see 'n-items-found {"num":18}'
  And I should see 'n-duplicate-answer-excluded {"num":15}'
  And I wait 1 seconds
  And I attach the file "/var/www/features/files/over_1500.csv" to "csv-file_field"
  And I should see 'n-items-found {"num":1612}'
  And I wait 2 seconds
  And I click on button "#import-file"
  Then I should see "75015 - PARIS ANTENNE DEX GRAND SUD OUEST"
  When I click on button "[id='questions[0].submit']"
  And I should see "your-question-has-been-registered"
  When I click on button "[id='parameters-submit']"
  And I wait 7 seconds
  And I should be redirected to "/admin/capco/app/questionnaire/questionnaireAdmin/edit"

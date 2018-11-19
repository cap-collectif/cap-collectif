@proposal_form_page_admin
Feature: Edit a proposal form

@database @javascript
Scenario: Logged in admin wants edit a proposal form page content
  Given I am logged in as admin
  And I go to the admin proposal form page with id "proposalFormVote"
  And I check a proposal form checkbox "summary toggle"
  And I check a proposal form checkbox "illustration toggle"
  And I fill in the following:
    | proposal_form_description | test intro text |
    | titleHelpText | test help text |
    | summaryHelpText | test help summary |
    | descriptionHelpText | test help description |
    | illustrationHelpText | test help illustration |
    | categoryHelpText | test help category |
  And I check a proposal form checkbox "category mandatory"
  And I click on a proposal form button "category add"
  And  fill in the following:
    | categories[0].name | test title |
  And I click on a proposal form button "category add popup save"
  And I check a proposal form checkbox "address toggle"
  And I fill in the following:
    | addressHelpText | test text |
    | latMap | 48.8587741 |
    | lngMap | 2.2069771 |
  And I check a proposal form checkbox "address limit"
  And I change the proposal form select "proposal form address zoom" with option 11
  And I click on a proposal form button "personal-field add"
  And I fill in the following:
    | questions[0].title | test title |
    | questions[0].helpText | test helptext |
  And I select "medias" from "questions[0].type"
  And I check "questions[0].required"
  And I click on a proposal form button "personal-field add popup save"
  And I click on a proposal form button "personal-section add"
  And  fill in the following:
    | questions[1].title | test section |
    | questions[1].description | greate description for my section |
  And I click on a proposal form button "personal-field add popup save"
  Then I save current admin proposal form "content"
  And I wait 1 seconds
  Then I should see "global.saved"

@database
Scenario: Logged in admin wants edit a proposal form on evaluation tab
  Given I am logged in as admin
  And I go to the admin proposal form page with id "proposalFormVote"
  Then I go to the admin proposal form evaluation tab
  And I change the proposal form select "proposal form evaluation question" with option questionnaire5
  And I wait 1 seconds
  Then I save current admin proposal form "evaluation"
  And I wait 2 seconds
  Then I should see "global.saved"

@database
Scenario: Logged in admin wants edit a proposal form on notification tab
  Given I am logged in as admin
  And I go to the admin proposal form page with id "proposalFormVote"
  Then I go to the admin proposal form notification tab
  And I check a proposal form checkbox "notification proposition modified"
  And I check a proposal form checkbox "notification commentary created"
  Then I save current admin proposal form "notification"
  And I wait 2 seconds
  Then I should see "global.saved"

@database @javascript
Scenario: Logged in admin wants edit a proposal form on settings tab
  Given I am logged in as admin
  And I go to the admin proposal form page with id "proposalFormVote"
  Then I go to the admin proposal form parameters tab
  And I fill in the following:
    | title | test text random |
  And I check a proposal form checkbox "parameters costable"
  Then I save current admin proposal form "parameters"
  And I wait 2 seconds
  Then I should see "global.saved"

@database
Scenario: Logged in admin wants to duplicate a proposal form
  Given I am logged in as admin
  And I duplicate a proposal form "proposalForm1"
  And I wait 1 seconds
  And I should be redirected to "/admin/capco/app/proposalform/list"
  Then I should see "your-form-has-been-duplicated"

@database
Scenario: Logged in admin wants to delete the first question on unattached form
  Given I am logged in as admin
  And I go to the admin proposal form page with id "proposalform13"
  And I click on a proposal form button "first question delete"
  And I click on a proposal form button "delete modale button"
  Then I save current admin proposal form "content"
  And I wait 1 seconds
  Then I should see "global.saved"

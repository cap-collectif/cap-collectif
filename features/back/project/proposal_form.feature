@admin @project @proposal_form_page_admin
Feature: Edit a proposal form

@database @rabbitmq
Scenario: Logged in admin wants edit a proposal form page content
  Given I am logged in as admin
  And I go to the admin proposal form page with id "proposalFormVote"
  And I wait "#proposal-form-admin-page" to appear on current page
  And I check a proposal form checkbox "summary toggle"
  And I check a proposal form checkbox "illustration toggle"
  And I fill in the following:
    | proposal_form_description | test intro text |
    | titleHelpText | test help text |
    | summaryHelpText | test help summary |
    | descriptionHelpText | test help description |
    | illustrationHelpText | test help illustration |
    | categoryHelpText | test help category |
  And I check element "proposal_form_category_mandatory"
  And I click on a proposal form button "category add"
  And  fill in the following:
    | categories[0].name | test title |
  And I click on a proposal form button "category add popup save"
  And I check a proposal form checkbox "address toggle"
  And I fill in the following:
    | addressHelpText | test text |
    | latMap | 48.8587741 |
    | lngMap | 2.2069771 |
  And I check element "proposal_form_district_proposalInAZoneRequired"
  And I change the proposal form select "proposal form address zoom" with option 11
  And I click the "#perso-field-add" element
  And I click the ".create-question" element
  And I fill in the following:
    | questions[0].title | test title |
    | questions[0].helpText | test description question |
  And I select "medias" from "questions[0].type"
  And I check element "questions[0].required"
  And I click on a proposal form button "personal-field add popup save"
  And I click the "#perso-field-add" element
  And I click the ".create-section" element
  And  fill in the following:
    | questions[1].title | test section |
    | questions[1].description | great description for my section |
  And I click on a proposal form button "personal-field add popup save"
  And I click the "#perso-field-add" element
  And I click the ".create-sub-section" element
  And  fill in the following:
    | questions[2].title | test sub section |
    | questions[2].description | great description for my sub section |
  And I click on a proposal form button "personal-field add popup save"
  Then I save current admin proposal form "content"
  And I wait ".alert__form_succeeded-message" to appear on current page
  Then I should see "global.saved"

@database @rabbitmq
Scenario: Logged in admin wants edit a proposal form on evaluation tab
  Given I am logged in as admin
  And I go to the admin proposal form page with id "proposalFormVote"
  Then I go to the admin proposal form analysis tab
  And I change the proposal form select "proposal form evaluation question" with option "UXVlc3Rpb25uYWlyZTpxdWVzdGlvbm5haXJlNQ=="
  And I wait 1 seconds
  Then I save current admin proposal form "evaluation"
  And I wait ".alert__form_succeeded-message" to appear on current page
  Then I should see "global.saved"

@database @rabbitmq
Scenario: Logged in admin wants edit a proposal form on notification tab
  Given I am logged in as admin
  And I go to the admin proposal form page with id "proposalFormVote"
  Then I go to the admin proposal form notification tab
  And I check element "proposal_form_notification_on_update"
  And I check element "proposal_form_notification_comment_on_create"
  Then I save current admin proposal form "notification"
  And I wait ".alert__form_succeeded-message" to appear on current page
  Then I should see "global.saved"

@database @rabbitmq
Scenario: Logged in admin wants edit a proposal form on settings tab
  Given I am logged in as admin
  And I go to the admin proposal form page with id "proposalFormVote"
  Then I go to the admin proposal form settings tab
  And I fill in the following:
    | title | test text random |
  And I check element "proposal_form_costable"
  Then I save current admin proposal form "parameters"
  And I wait ".alert__form_succeeded-message" to appear on current page
  Then I should see "global.saved"

@database @rabbitmq
Scenario: Logged in admin wants to duplicate a proposal form
  Given I am logged in as admin
  And I duplicate a proposal form "proposalForm1"
  And I wait 1 seconds
  And I should be redirected to "/admin/capco/app/proposalform/list"
  Then I should see "your-form-has-been-duplicated"

@database @rabbitmq
Scenario: Logged in admin wants to delete the first question on unattached form
  Given I am logged in as admin
  And I go to the admin proposal form page with id "proposalform13"
  And I click on a proposal form button "first question delete"
  And I click on a proposal form button "delete modale button"
  Then I save current admin proposal form "content"
  And I wait ".alert__form_succeeded-message" to appear on current page
  Then I should see "global.saved"

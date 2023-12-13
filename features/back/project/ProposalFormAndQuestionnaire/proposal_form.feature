@admin @project @proposal_form_page_admin
Feature: Edit a proposal form

@database @rabbitmq
Scenario: Logged in admin wants to edit a proposal form page content
  Given I am logged in as admin
  And I go to the admin proposal form page with id "proposalFormVote"
  And I wait "#proposal-form-admin-page" to appear on current page
  And I check element "proposal_form_using_summary_field"
  And I check element "proposal_form_using_illustration_field"
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
  And I scroll to element "#proposal_form_category_mandatory"
  And I check element "proposal_form_using_address_field"
  And I fill in the following:
    | addressHelpText | test text |
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
  And I click the "#perso-field-add" element
  And I click the ".create-question" element
  And I fill in the following:
    | questions[3].title | test range number |
    | questions[3].helpText | test range description question |
  And I select "number" from "questions[3].type"
  And I wait "#proposal-form-admin-configuration_isRangeBetween" to appear on current page
  And I check element "proposal-form-admin-configuration_isRangeBetween"
  And I fill in the following:
    | questions[3].rangeMin| 1000 |
    | questions[3].rangeMax | 10 |
  And I should see 'error.min-higher-maximum'
  And I fill in the following:
    | questions[3].rangeMin| 0 |
    | questions[3].rangeMax | 0 |
  And I should see 'error.define-value'
  And I fill in the following:
    | questions[3].rangeMin| 100 |
    | questions[3].rangeMax | 1000 |
  And I click on a proposal form button "personal-field add popup save"
  And I scroll to the bottom
  Then I save current admin proposal form "content"
  And I wait ".alert__form_succeeded-message" to appear on current page

@database @rabbitmq
Scenario: Logged in admin wants to edit a proposal form on notification tab
  Given I am logged in as admin
  And I go to the admin proposal form page with id "proposalFormVote"
  Then I go to the admin proposal form notification tab with a timeout of "5000" ms
  And I check element "proposal_form_notification_on_update"
  And I check element "proposal_form_notification_comment_on_create"
  Then I save current admin proposal form "notification"
  And I wait ".alert__form_succeeded-message" to appear on current page
  Then I should see "global.saved"

@database @rabbitmq
Scenario: Logged in admin wants to edit a proposal form on settings tab
  Given I am logged in as admin
  And I go to the admin proposal form page with id "proposalFormVote"
  Then I go to the admin proposal form settings tab with a timeout of "5000" ms
  And I fill in the following:
    | title | test text random |
  And I check element "proposal_form_costable"
  Then I save current admin proposal form "parameters"
  And I wait ".alert__form_succeeded-message" to appear on current page
  Then I should see "global.saved"

# Need to make admin-next work on capco.test...
#@database @rabbitmq
#Scenario: Logged in admin wants to duplicate a proposal form
#  Given I am logged in as admin
#  And I go to the admin proposal form list page
#  Then I hover over the "table .cap-table__tr:first-child" element
#  Then I click on button ".btn-duplicate:first-child"
#  Then I should see "copy-of Ils ne servent que des pintes ?"

@database @rabbitmq
Scenario: Logged in admin wants to delete the first question on unattached form
  Given I am logged in as admin
  And I go to the admin proposal form page with id "proposalform13"
  And I click on button "#js-btn-trash-0"
  And I click on a proposal form button "delete modale button"
  Then I save current admin proposal form "content"
#  todo rewrite failing test
#  And I wait ".alert__form_succeeded-message" to appear on current page maximum "60"
#  Then I should see "global.saved"

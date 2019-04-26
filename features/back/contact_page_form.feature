@contact_page_form
Feature: Edit the contact page

@database
Scenario: Logged in admin wants to update contact page title
  Given I am logged in as admin
  And I go to the admin contact list page
  And I fill in the following:
    | title | Je suis le titre la page de contact |
  And I press "global.save"
  And I wait 1 seconds
  And I should see "global.saved"

@database @dev
Scenario: Logged in admin wants to update contact page advanced properties
  Given I am logged in as admin
  And I go to the admin contact list page
  And I fill in the following:
    | custom.metadescription | Je suis la metadescription la page de contact |
    | custom.customcode | <script> console.log("Je suis le code personnalisé de la page contact") |
  And I press "global.save"
  And I wait 1 seconds
  And I should see "global.saved"

@database
Scenario: Logged in admin wants to update contact page title with empty title
  Given I am logged in as admin
  And I go to the admin contact list page
  And I fill in the following:
    | title | |
  And I should see "fill-field"

@contact_page_form
Feature: Edit the contact page

@database
Scenario: Logged in admin wants to update contact page title
  Given I am logged in as admin
  And I go to the admin contact list page
  And I fill in the following:
    | title | Je suis la page de contact |
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

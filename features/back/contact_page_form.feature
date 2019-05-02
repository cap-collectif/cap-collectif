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

@database
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
Scenario: Logged in admin wants to add a contact in /contact
  Given I am logged in as admin
  And I go to the admin contact list page
  And I click on button "[id='openAddModalButton']"
  When I fill the contact form
  And I press "CreateContactAdminForm-submit-create-contact"
  And I wait 1 seconds
  Then I should see "Contact Form Test"

@database 
Scenario: Logged in admin wants to update a contact in /contact
  Given I am logged in as admin
  And I go to the admin contact list page
  And I click on button "[id='UpdateContact-Q29udGFjdEZvcm06Y29udGFjdEZvcm0x']"
  When I update the contact form
  And I press "UpdateContactAdminForm-Q29udGFjdEZvcm06Y29udGFjdEZvcm0x-submit-create-contact"
  And I wait "#global-alert-box .alert-success" to appear on current page

@database
Scenario: Logged in admin wants to add a contact in /contact
  Given I am logged in as admin
  And I go to the admin contact list page
  Then I should see "Contact Form 1"
  And I click on button "[id='DeleteContact-Q29udGFjdEZvcm06Y29udGFjdEZvcm0x']"
  Then I press "delete-modal-button-delete"
  Then I should not see "Contact Form 1"

@database
Scenario: Logged in admin wants to update contact page title with empty title
  Given I am logged in as admin
  And I go to the admin contact list page
  And I fill in the following:
    | title | |
  And I should see "fill-field"

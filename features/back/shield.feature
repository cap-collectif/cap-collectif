@shield
Feature: Shield admin configuration

Background:
  Given I am logged in as super admin

@database
Scenario: Logged in admin want to update shield configuration
  Given I go to the admin shield configuration page
  And I toggle shield mode
  And I fill in the following:
    | shield-admin-form_introduction | Shield intro |
  And I attach the file "/var/www/features/files/image.jpg" to "shield-admin-form_media_field"
  And I wait 3 seconds
  Then I save shield admin form
  And I wait ".alert__form_succeeded-message" to appear on current page

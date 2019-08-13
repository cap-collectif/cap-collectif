@core @profile
Feature: Profil

Background:
  Given feature "profiles" is disabled

@database
Scenario: Logged in user wants to change his username, and profiles feature is disabled
  Given I am logged in as user
  And I visited "edit profile page"
  And I wait "#account-tabs-pane-profile" to appear on current page
  And I fill in the following:
    | profile-form-username | user3 |
  And I wait 1 seconds
  And I press "profile-form-save"
  And I wait ".alert__form_succeeded-message" to appear on current page
  Then I should see "global.saved"

@database
Scenario: Logged in user wants to change his username with empty field
  Given I am logged in as user
  And I visited "edit profile page"
  And I wait "#account-tabs-pane-profile" to appear on current page
  And I fill in the following:
    | profile-form-username |  |
  And I wait 1 seconds
  Then I should see "fill-field"

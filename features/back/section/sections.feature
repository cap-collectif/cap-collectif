@admin @section
Feature: Admin Section

Background:
  Given feature "unstable__multilangue" is enabled

@database
Scenario: Logged in super admin wants to edit a user profile
  Given I am logged in as admin
  And I go to the admin section list page
  And I click on the admin multilangue dropddown navbar item with french locale
  Then I should see "Restez à l'écoute"

@database
Scenario: Logged in super admin wants to edit a user profile
  Given I am logged in as admin
  And I go to the admin section list page
  And I click on the admin multilangue dropddown navbar item with english locale
  Then I should see "Social networks"

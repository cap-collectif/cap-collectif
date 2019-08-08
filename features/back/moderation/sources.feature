@admin
Feature: Admin sources back office

Scenario: Logged in admin wants to tests sources list page
  Given I am logged in as admin
  And I go to the admin sources list page
  And I should not see "error.500"

@admin
Feature: Admin features Argument

Scenario: Logged in admin wants to test admin contributions
  Given I am logged in as admin
  And I go to the admin argument list page
  And I should not see "error.500"

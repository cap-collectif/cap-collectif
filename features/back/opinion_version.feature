@admin
Feature: Admin opinion version back office

Scenario: Logged in admin wants to tests opinion version list page
  Given I am logged in as admin
  And I go to the admin opinion version list page
  And I should not see "error.500"

@admin
Feature: Admin features

Scenario: Logged in admin wants to tests all admin list page
  Given I am logged in as admin
  And I go to the admin general list page
  And I should not see "error.500"

Scenario: Logged in admin wants to test admin dashboard
  Given I am logged in as admin
  And I go to the admin dashboard page
  And I should not see "error.500"

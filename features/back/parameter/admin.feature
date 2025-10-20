@admin
Feature: Admin features

Scenario: Logged in admin wants to tests all admin list page
  Given I am logged in as admin
  And I go to the admin general list page
  And I should not see "error.500"
  Then I go to the admin opinion list page
  And I should not see "error.500"

Scenario: Logged in admin wants to access admin dashboard
  Given I am logged in as admin
  And I go to the admin dashboard page
  And I should not see "error.500"

Scenario: Non-generated fonts can be found
  Given I am logged in as admin
  And I go to "/fonts/openSans/OpenSans-Bold.ttf"
  Then I should not see "error.404"

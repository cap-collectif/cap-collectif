@admin
Feature: Admin features

Scenario: Logged in admin wants to tests all admin list page
  Given I am logged in as admin
  And I go to the admin general list page
  And I should not see "error.500"
  Then I go to the admin opinion list page
  And I should not see "error.500"

Scenario: Logged in admin wants to test admin dashboard
  Given I am logged in as admin
  And I go to the admin dashboard page
  And I should not see "error.500"

Scenario: Non-generated fonts can be found
  Given I am logged in as admin
  And I go to "/fonts/Nantaise-Bold.otf"
  Then I should not see "error.404"

Scenario: Logged in admin wants to make a search
  Given I am logged in as admin
  And I go to the admin dashboard page
  Then I search 'test' in admin
  And I should not see "error.500"

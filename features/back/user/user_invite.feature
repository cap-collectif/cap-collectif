@admin @user
Feature: User invitations Admin

Scenario: Logged in super admin wants to go to the user invite page
  Given I am logged in as super admin
  When I go to the admin user invite page
  Then I should not see "error.500"

Scenario: Logged in admin wants to go to the user invite page
  Given I am logged in as admin
  When I go to the admin user invite page
  Then I should not see "error.500"

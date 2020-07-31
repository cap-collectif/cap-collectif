@admin @user
Feature: User invitations Admin

Scenario: Logged in super admin wants to go to the user invite page when the feature flag is activated
  Given I am logged in as super admin
  And feature "user_invitations" is enabled
  When I go to the admin user invite page
  Then I should not see "error.500"

Scenario: Logged in super admin wants to go to the user invite page when the feature flag is deactivated
  Given I am logged in as super admin
  And feature "user_invitations" is disabled
  When I go to the admin user invite page
  Then I should see "error.404"

Scenario: Logged in admin wants to go to the user invite page when the feature flag is activated
  Given I am logged in as admin
  And feature "user_invitations" is enabled
  When I go to the admin user invite page
  Then I should see "403-error"

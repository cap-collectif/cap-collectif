@core @shield
Feature: Shield Mode

Background:
  Given feature "shield_mode" is enabled

Scenario: Anonymous should see shield, can't register but can connect
  And I visited "home page"
  And I should see the shield
  And I fill in the following:
    | username    | user@test.com       |
    | password    | user                |
  And I press "global.login_me"
  And I wait 2 seconds
  Then I can see I am logged in as "user"
  And I should not see the shield

Scenario: Anonymous should see shield and can register
  Given feature "registration" is enabled
  And I visited "home page"
  And I wait "#shield-agent" to appear on current page
  Then I should see the shield

Scenario: Registered but not validated user wants to connect when shield mode enabled
  And I visited "home page"
  And I should see the shield
  And I fill in the following:
    | username    | user_not_confirmed@test.com       |
    | password    | user_not_confirmed                |
  And I press "global.login_me"
  And I wait 2 seconds
  Then I should see "please-confirm-your-email-address-to-login"

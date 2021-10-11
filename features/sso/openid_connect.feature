@sso @openid
Feature: Open ID

Background:
  Given feature "login_openid" is enabled
  # TODO Perf: this should be replaced by a BDD call
  Given I am logged in as super admin
  And I go to the admin shield configuration page
  And I enable toggle "Oauth2"
  When I go to "/"
  And I logout
  Then I should see "global.login"

@database
Scenario: Display Openid modal
  Given I open login modal
  When I follow "Oauth2"
  Then I should see the Openid Connect login screen

# @database
# Scenario: User signup and disconnect via OpenID
#   When I authenticate with openid as test with password test
#   Then I should be redirected to "/"
#   And I can see I am logged in as "testFirstname testLastname"
#   When I logout
#   Then I should see "global.login"

# @database
# Scenario: User signup and see profile
#   When I authenticate with openid as test with password test
#   Then I should be redirected to "/"
#   And I can see I am logged in as "testFirstname testLastname"
#   When I go to my sso profile
#   Then I should be redirected to "https://keycloak.cap-collectif.com/auth/realms/master/account"

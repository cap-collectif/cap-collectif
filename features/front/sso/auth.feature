@sso
Feature: Sso redirection

#@database @dev
#Scenario: Anonymous wants to connect through SSO without losing his current page on the website and with by pass
#  Given feature "oauth2_switch_user" is enabled
#  Given feature "sso_by_pass_auth" is enabled
#  Then enable sso provider "ssoOauth2"
#  And I go to a selection step with simple vote enabled
#  And I click on button "#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwx"
##  And I click on button "#proposal-UHJvcG9zYWw6cHJvcG9zYWwy > div:nth-child(1) > div:nth-child(2) > span:nth-child(1) > div:nth-child(2) > div:nth-child(2) > div:nth-child(2) > span:nth-child(3) > button:nth-child(1)"
#  And I click on button "#proposal-UHJvcG9zYWw6cHJvcG9zYWwy > #login-popover button"
#  And login button should redirect to "/login/openid?_destination=https://capco.test/sso/switch-user?_destination=https://capco.test/project/budget-participatif-rennes/selection/selection"
#  And I fill in the following:
#  | username | ptondereau |
#  | password | podia krakatoa hate manicure pink lilac |
#  And I click on button "#kc-login"
#  And I wait "#sso-logging-button" to appear on current page
#  And I click on button "#sso-logging-button"
#  And I should be redirected to "/project/budget-participatif-rennes/selection/selection"

@database
Scenario: Logged in from ssoOauth2 user wants to soft delete his account
  Given feature "oauth2_switch_user" is enabled
  Given feature "sso_by_pass_auth" is enabled
  Then enable sso provider "ssoOauth2"
  And I visited "home page"
  When I press "global.login"
  Then I authenticate with openid as test with password test
  Then I should be redirected to "/"
  When I visited "edit profile page"
  And I wait "#account-tabs-tab-account" to appear on current page
  And I click the "#account-tabs-tab-account" element
  And I wait "#delete-account-profile-button" to appear on current page
# Without it fails with "element not interactable" -> maybe present in DOM but not yet clickable
  And I wait 1 seconds
  And I click on button "#delete-account-profile-button"
  And I wait "#confirm-delete-form-submit" to appear on current page
  When I click the "#confirm-delete-form-submit" element
  Then I should be redirected to "/"
@sso
Feature: Sso redirection

@database
Scenario: User wants to connect through SSO without losing his current page on the website and with by pass
  Given feature "disconnect_openid" is enabled
  Given feature "sso_by_pass_auth" is enabled
  Then enable sso provider "ssoOauth2"
  And I go to a selection step with simple vote enabled
  And I click on button "#proposal-vote-btn-UHJvcG9zYWw6cHJvcG9zYWwx"
  And login button should redirect to "/login/openid?_destination=https://capco.test/sso/switch-user?_destination=https://capco.test/project/budget-participatif-rennes/selection/selection"
  And I click on button "#login-popover button"
  And I fill in the following:
  | username | ptondereau |
  | password | podia krakatoa hate manicure pink lilac |
  And I click on button "#kc-login"
  And I wait "#sso-logging-button" to appear on current page
  And I click on button "#sso-logging-button"
  And I should be redirected to "/project/budget-participatif-rennes/selection/selection"

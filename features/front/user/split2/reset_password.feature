@core @profile
Feature: Resetting forgotten password

@database
Scenario: Admin wants to enable his account and set his password
  Given features "registration", "profiles" are enabled
  And I go to "/account/email_confirmation/check-my-email-token"
  Then I should be redirected to "/resetting/reset/reset-my-password-token"
  And I wait "#reset-content-confirm" to appear on current page
  When I fill in the following:
    | password-form-new  | a |
    | password-form-confirmation | a |
  Then I should see "at-least-8-characters-one-digit-one-uppercase-one-lowercase" within 3 seconds
  When I fill in the following:
    | new_password  | a |
    | new_password_confirmation | q |
  And I wait 2 seconds
  Then I should see "fos_user.password.mismatch"
  When I fill in the following:
    | new_password  | Toto91toto  |
    | new_password_confirmation | Toto91toto  |
  And I wait 2 seconds
  And I press "reset-content-confirm"
  And I wait "global.loading" to disappear on current page
  Then I should be redirected to "/"
  Then I can see I am logged in as "admin_without_password"
  And I should see "resetting.flash.success"

@core @profile
Feature: Resetting forgotten password

@database
Scenario: Admin wants to enable his account and set his password
  Given features "registration", "profiles" are enabled
  And I go to "/account/email_confirmation/check-my-email-token"
  Then I should be redirected to "/resetting/reset/reset-my-password-token"
  When I fill in the following:
    | recreate_password_form_plainPassword_first  | a |
    | recreate_password_form_plainPassword_second | a |
  And I press "global.confirm"
  And I wait "#at-least-8-characters-one-digit-one-uppercase-one-lowercase" to appear on current page
  When I fill in the following:
    | recreate_password_form_plainPassword_first  | a |
    | recreate_password_form_plainPassword_second | q |
  And I press "global.confirm"
  Then I should see "fos_user.password.mismatch"
  When I fill in the following:
    | recreate_password_form_plainPassword_first  | Toto91toto  |
    | recreate_password_form_plainPassword_second | Toto91toto  |
  And I press "global.confirm"
  Then I should be redirected to "/"
  Then I can see I am logged in as "admin_without_password"
  And I should see "resetting.flash.success"

@core @login
Feature: Login

Scenario: A user wants to login and see he has successfully logged in.
  Given I am logged in as user
  Then I can see I am logged in as "user"

@randomly-failing
Scenario: An admin wants to login and see he has successfully logged in.
  Given I am logged in as admin
  Then I can see I am logged in as "admin"
  And I can access admin in navbar

Scenario: A logged user wants to logout
  Given I am logged in as user
  When I logout
  Then I should see "global.login"

@database
Scenario: User has lost password
  Given I open login modal
  When I follow "global.forgot_password"
  And  I fill in "email" with "user@test.com"
  And I press "resetting.request.submit"
  Then I should see 'resetting.check_email {"%email%":"user@test.com"}'

@database
Scenario: User has lost password and email should be sent
  Given I open login modal
  When I follow "global.forgot_password"
  And  I fill in "email" with "user@test.com"
  And I press "resetting.request.submit"
  Then I should see 'resetting.check_email {"%email%":"user@test.com"}'
  And I open mail with subject "email-subject-resetting-password"
  And I should see "email-content-resetting-password" in mail

@database
Scenario: Admin wants to enable his account and set his password
  Given features "registration", "profiles" are enabled
  And I go to "/account/email_confirmation/check-my-email-token"
  Then I should be redirected to "/resetting/reset/reset-my-password-token"
  When I fill in the following:
    | fos_user_resetting_plainPassword_first  | capcopopototo |
    | fos_user_resetting_plainPassword_second | capcopopototo |
  And I press "change_password.form.submit"
  Then I should be redirected to "/"
  Then I can see I am logged in as "admin_without_password"
  And I should see "resetting.flash.success"

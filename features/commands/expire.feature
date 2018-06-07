@expire
Feature: Expire Commands

@database
Scenario: Cron wants to expire users
  When I run "capco:expire-users"
  Then the command exit code should be 0
  And I should see "2 user(s) expired." in output
  And 2 mail should be sent
  And I open mail to "user_not_confirmed_to_be_expired@test.com"
  And I should see "email.expire_user.info_no_contrib" in mail
  And I should see 'email.expire_user.confirm {"%url%":"http:\/\/capco.dev\/account\/email_confirmation\/qsdfghjklm"}' in mail
  And I open mail to "user_not_confirmed_with_contributions_to_be_expired@test.com"
  And I should see "email.expire_user.info_with_contrib" in mail
  And I should see 'email.expire_user.confirm {"%url%":"http:\/\/capco.dev\/account\/email_confirmation\/oklmoklm"' in mail

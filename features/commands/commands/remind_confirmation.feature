Feature: Remind confirmation Commands

@parallel-scenario @database
Scenario:
  Given user "user_not_confirmed" registered less than 2880 minutes ago
  And feature "remind_user_account_confirmation" is enabled
  And user "userNotConfirmedWithContributions" registered less than 2880 minutes ago
  # This users are already confirmed and should not be reminded
  And user "user1" registered less than 2880 minutes ago
  And I run "capco:remind-user-account-confirmation"
  Then the command exit code should be 0
  And I should see "2 user(s) reminded." in output
  # We make sure, if we run the command again to not spam the users…
  Given I run "capco:remind-user-account-confirmation"
  Then the command exit code should be 0
  And I should see "0 user(s) reminded." in output

@parallel-scenario @database
Scenario:
  Given user "user_not_confirmed" registered less than 25 minutes ago
  And feature "remind_user_account_confirmation" is enabled
  And user "userNotConfirmedWithContributions" registered less than 2880 minutes ago
  # This users are already confirmed and should not be reminded
  And user "user1" registered less than 78 minutes ago
  And user "user2" registered less than 25 minutes ago
  And I run "capco:remind-user-account-confirmation"
  Then the command exit code should be 0
  And I should see "1 user(s) reminded." in output
  # We make sure, if we run the command again to not spam the users…
  Given I run "capco:remind-user-account-confirmation"
  Then the command exit code should be 0
  And I should see "0 user(s) reminded." in output

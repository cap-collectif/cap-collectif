Feature: Remind confirmation Commands

@parallel-scenario
Scenario: Cron job wants to remind users to confirme their accounts
  Given user "user_not_confirmed" registered less than 1 week ago
  And user "user_not_confirmed_with_contribution" registered less than 1 week ago
  # This user is already confirmed and should not be reminded
  And user "user1" registered less than 1 week ago
  And I run "capco:remind-user-account-confirmation"
  Then the command exit code should be 0
  And I should see "2 user(s) reminded." in output
  # We make sure, if we run the command again to not spam the users…
  Given I run "capco:remind-user-account-confirmation"
  Then the command exit code should be 0
  And I should see "0 user(s) reminded." in output

Feature: Remind confirmation Commands

@parallel-scenario
Scenario: Cron job wants to remind users to confirme their accounts
  Given I run "capco:remind-user-account-confirmation"
  Then the command exit code should be 0
  And I should see "3 user(s) reminded." in output
  Given I run "capco:remind-user-account-confirmation"
  Then the command exit code should be 0
  And I should see "0 user(s) reminded." in output

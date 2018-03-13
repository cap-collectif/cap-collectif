@proposal_followers
Feature: Notify Followers Command

@parallel-scenario
Scenario: "Cron want to notify followers"
  Given I run "capco:follower-proposal-notifier"
  Then the command exit code should be 0
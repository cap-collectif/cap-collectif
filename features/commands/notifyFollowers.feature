@proposal_follow @proposal_follower_email
Feature: Notify Followers Command

@parallel-scenario @snapshot
Scenario: "Cron want to notify followers and open an email"
  Given I run "capco:follower-notifier --time=2017-02-01"
  Then the command exit code should be 0
  And 67 mail should be sent
  And I open mail to "user@test.com"
  Then email should match snapshot 'notify_followers<user@test.com>.html'
  And I open mail to "admin@test.com"
  Then email should match snapshot 'notify_followers<admin@test.com>.html'

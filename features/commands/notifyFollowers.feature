@proposal_follow @proposal_follower_email
Feature: Notify Followers Command

@parallel-scenario @rabbitmq @snapshot-email
Scenario: "Cron want to notify followers and open an email"
  Given I run "capco:follower-notifier --time=2017-02-01"
  Then the command exit code should be 0
  And 67 mail should be sent
  And I open mail with subject 'your-activity-summary-of {"{siteName}":"Cap-Collectif"}' from "assistance@cap-collectif.com" to "user@test.com"
  And I should see 'new-activity-count {&quot;count&quot;:4,&quot;num&quot;:4}' in mail
  And I open mail to "admin@test.com"
  And I should see '<b>hello-username {&quot;{username}&quot;:&quot;admin&quot;}</b><br>' in mail

@parallel-scenario @rabbitmq @snapshot-email
Scenario: "Checking if blog articles, related to a proposal followed by a user, publications are notified to the latter"
  Given I run "capco:follower-notifier --time=2019-01-01"
  Then the command exit code should be 0
  And 66 mail should be sent
  And I open mail to "user@test.com"
  Then email should match snapshot 'notify_followers<user@test.com>_blog_post.html'
  And I open mail to "admin@test.com"
  Then email should match snapshot 'notify_followers<admin@test.com>_blog_post.html'

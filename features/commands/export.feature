Feature: Export Commands

Background:
  Given feature "export" is enabled

@parallel-scenario
Scenario: Admin wants to export consultation steps
  Given I run "capco:export:consultation"
  Then the command exit code should be 0

@parallel-scenario
Scenario: Admin wants to export collect steps
  Given I run "capco:export:collect"
  Then the command exit code should be 0

@parallel-scenario
Scenario: Admin wants to export questionnaire steps
  Given I run "capco:export:questionnaire"
  Then the command exit code should be 0

@parallel-scenario @database
Scenario: User want to export his datas and 7 days after the cron delete the zip archive
  Given I run "capco:export:user userAdmin"
  And the command exit code should be 0
  Then I should see "userAdmin.zip" file in "/var/www/web/export" directory
  And I wait 2 seconds
  And I run "capco:user_archives:delete"
  Then I should not see "userAdmin.zip" file in "/var/www/web/export" directory

@parallel-scenario
Scenario: Admin wants to export users
  Given I run "capco:export:users"
  Then the command exit code should be 0

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

@database
Scenario: User want to export his datas and 7 days after the cron delete the zip archive
  Given I run "capco:export:user userAdmin"
  And the command exit code should be 0
  And I wait 2 seconds
  Then I check if the archive is created for the user "userAdmin"
  And I run "capco:user_archives:delete"
  And the command exit code should be 0
  Then I check if the archive is deleted for the user "userAdmin"

@parallel-scenario
Scenario: Admin wants to export users
  Given I run "capco:export:users"
  Then the command exit code should be 0

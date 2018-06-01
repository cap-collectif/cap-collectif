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

@parallel-scenario
Scenario: Admin wants to export users
  Given I run "capco:export:users"
  Then the command exit code should be 0

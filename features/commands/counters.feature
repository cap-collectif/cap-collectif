@counters
Feature: Counters computation Commands

@database
Scenario: Cron job wants to compute projects counters
  Given I run "capco:compute:projects-counters"
  Then the command exit code should be 0

@database
Scenario: Cron job wants to compute projects counters
  Given I run "capco:compute:projects-counters --force"
  Then the command exit code should be 0

@database
Scenario: Cron job wants to compute users counters
  Given I run "capco:compute:users-counters"
  Then the command exit code should be 0

@database
Scenario: Cron job wants to compute users counters
  Given I run "capco:compute:users-counters --force"
  Then the command exit code should be 0

@database
Scenario: Cron job wants to compute application counters
  Given I run "capco:compute:counters"
  Then the command exit code should be 0

@database
Scenario: Cron job wants to compute application counters
  Given I run "capco:compute:counters --force"
  Then the command exit code should be 0

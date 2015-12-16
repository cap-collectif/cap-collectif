@synthesis
Feature: Synthesis Commands

@database
Scenario: Admin want to update synthesis data
  Given I run "capco:syntheses:update -e test"
  Then the command exit code should be 0

@database
Scenario: Admin want to recalculate synthesis counters
  Given I run "capco:syntheses:counters -e test"
  Then the command exit code should be 0

@database
Scenario: Admin want to fix contributions urls on synthesis elements
  Given I run "capco:syntheses:fix-urls -e test"
  Then the command exit code should be 0

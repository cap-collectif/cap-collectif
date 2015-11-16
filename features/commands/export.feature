Feature: Export Commands

@database
Scenario: Admin wants to export consultation steps
    Given I run "capco:export:consultation"
    Then the command exit code should be 0

@database
Scenario: Admin wants to export collect steps
    Given I run "capco:export:collect"
    Then the command exit code should be 0


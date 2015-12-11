Feature: Import Commands

@database
Scenario: Admin want to load base data
    Given I run "capco:load-base-data --force"
    Then the command exit code should be 0

@database
Scenario: Admin want to create a PJL
    Given I run "capco:import:pjl-from-csv"
    Then the command exit code should be 0


Feature: Import Commands

@database
Scenario: Admin wants to load base data
    Given I run "capco:load-base-data --force"
    Then the command exit code should be 0

@database
Scenario: Admin wants to create a PJL
    Given I run "capco:import:pjl-from-csv"
    Then the command exit code should be 0

@database
Scenario: Admin wants to import a consultation
    Given I run "capco:import:consultation-from-csv consultation/opinions.csv admin@test.com collecte-des-avis"
    Then the command exit code should be 0


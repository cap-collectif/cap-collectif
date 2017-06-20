Feature: Import Commands

@database
Scenario: Admin wants to load prod data
    Given I run "capco:load-prod-data --force"
    Then the command exit code should be 0

@database
Scenario: Admin wants to create a PJL
    Given I run "capco:import:pjl-from-csv"
    Then the command exit code should be 0

@database
Scenario: Admin wants to import a consultation
    Given I run "capco:import:consultation-from-csv consultation/opinions.csv admin@test.com collecte-des-avis"
    Then the command exit code should be 0

@database
Scenario: Admin wants to create a PJL
    Given I run "capco:create-users-account-from-csv consultation/users.csv"
    Then the command exit code should be 0
    And I should see "2 users created." in output
    And 2 mail should be sent

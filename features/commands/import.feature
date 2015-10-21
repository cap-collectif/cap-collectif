Feature: Import Commands

@database
Scenario: Admin want to create a PJL
    Given I run "doctrine:database:drop --force"
    And I run "doctrine:database:create"
    And I run "doctrine:schema:update --force"
    And I run "capco:load-base-data --force"
    And I run "import:pjl-from-csv"
    Then the command exit code should be 0

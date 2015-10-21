Feature: Migration Commands

@database
Scenario: Admin want to migrate database from scratch
    Given I run "doctrine:database:drop -n --force -e test"
    And I run "doctrine:database:create -n -e test"
    And I run "doctrine:migration:migrate -n -e test"
    And the command exit code should be 0
    When I run "doctrine:schema:validate -e test"
    Then the command exit code should be 0


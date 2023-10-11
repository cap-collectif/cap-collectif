Feature: Migration Commands

@database @migration
Scenario: Admin want to migrate database from scratch
  Given I run "doctrine:database:drop --force"
  And I run "doctrine:database:create"
  And I run "doctrine:migration:migrate"
  And the command exit code should be 0
  When I run "doctrine:schema:validate"
  Then the command exit code should be 0

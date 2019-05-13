Feature: API Commands

Scenario: DevOps wants to create an api token
  Given I run "capco:api:create-token lbrunet@jolicode.com"
  Then the command exit code should be 0

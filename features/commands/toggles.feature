@toggles
Feature: Toggles Commands

@parallel-scenario
Scenario: I want to disable a given feature toggle that it's active
  Given feature zipcode_at_register is enabled
  And I run "capco:toggle:disable zipcode_at_register"
  Then feature zipcode_at_register should be disabled
  And the command exit code should be 0

@parallel-scenario
Scenario: I want to activate a given feature toggle that it's disables
  Given feature zipcode_at_register is disabled
  And I run "capco:toggle:enable zipcode_at_register"
  Then feature zipcode_at_register should be enabled
  And the command exit code should be 0

@parallel-scenario
Scenario: I try to activate a given feature toggle that it's already active
  Given feature zipcode_at_register is enabled
  And I run "capco:toggle:enable zipcode_at_register"
  Then feature zipcode_at_register should be enabled
  And the command exit code should be 0

@parallel-scenario
Scenario: I try to disable a given feature toggle that it's already disabled
  Given feature zipcode_at_register is disabled
  And I run "capco:toggle:disable zipcode_at_register"
  Then feature zipcode_at_register should be disabled
  And the command exit code should be 0

@parallel-scenario
Scenario: I try to disable a feature toggle that doesn't exist
  Given I run "capco:toggle:disable zipcode_at_registere"
  And the command exit code should be 1

@parallel-scenario
Scenario: I try to activate a feature toggle that doesn't exist
  Given I run "capco:toggle:enable zipcode_at_registere"
  And the command exit code should be 1

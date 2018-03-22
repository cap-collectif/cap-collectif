Feature: Search Commands

@parallel-scenario
Scenario: DevOps wants to populate elasticsearch
  Given I run "fos:elastica:populate -n"
  Then the command exit code should be 0

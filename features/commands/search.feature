Feature: Search Commands

@parallel-scenario
Scenario: DevOps wants to populate elasticsearch
  Given I run "capco:es:populate -n"
  Then the command exit code should be 0

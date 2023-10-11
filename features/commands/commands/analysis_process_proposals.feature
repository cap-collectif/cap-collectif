Feature: Process Proposal Analysis Commands

@database
Scenario: User wants to process automatically proposals
  Given feature "unstable__analysis" is enabled
  Given I run "capco:process_proposals --time='2021-01-01 03:00:00'"
  Then the command exit code should be 0
  And I should see "2 proposals have been processed." in output

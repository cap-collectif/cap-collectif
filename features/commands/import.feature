Feature: Import Commands

@purge @database
Scenario: Anonymous user wants to list instances
     Given I run "import:acc"
     Then the command exit code should be 0


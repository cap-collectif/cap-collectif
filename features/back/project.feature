@project_admin
Feature: Project Admin

@database
Scenario: Logged in admin wants to add a project.
  Given I am logged in as admin
  And I visited "admin project page"
  When I click the project add button
  Then I should see "create-a-project"
  And I fill in the following:
    | title  | Super project |
  And I fill the authors field
  And I wait 10 seconds
  When I submit the project add modal
  Then I should see "global.saved"

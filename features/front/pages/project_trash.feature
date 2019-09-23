@project @core
Feature: Project Trash

Scenario: User wants to see project's trash (project with one consultStep at least)
  Given feature "project_trash" is enabled
  And I am logged in as admin
  And I visited "project trashed page" with:
    | projectSlug | budget-avec-vote-limite |
  Then I should see "project.show.trashed.none"

@project @core
Feature: Project Trash

Scenario: User wants to see project's trash (project with one consultStep at least)
  Given feature "project_trash" is enabled
  And I am logged in as admin
  And I visited "project trashed page" with:
    | projectSlug | budget-avec-vote-limite |
  Then I wait ".cap-bubble-attention-6" to appear on current page

Scenario: User wants to see project's trash when a consultation have moderated sources
  Given feature "project_trash" is enabled
  And I am logged in as admin
  And I visited "project trashed page" with:
    | projectSlug | projet-de-loi-renseignement |
  Then I should not see "error.500"

Scenario: User wants to see project's trash on a debate
  Given feature "project_trash" is enabled
  And I am logged in as admin
  And I visited "project trashed page" with:
    | projectSlug | debat-sur-le-cannabis |
  Then I should see "Un contenu digne de la corbeille"

@projectDistrict
Feature: Project District

Background:
  Given I am logged in as admin
  Given I visited "admin project district page"
  And I wait 1 seconds

@database
Scenario: Logged in admin wants to add district in project.
  When I click the add button
  And I wait 1 seconds
  Then I should see "district_modal.create.title"
  And I wait 1 seconds
  When I enable the border checkbox
  And I fill in the following:
    | projectDistrict.name  | troisième-quartier |
    | projectDistrict.border.size  | 12 |
    | projectDistrict.border.opacity  | 50 |
  When I pick a color
  When I submit the modal
  And I wait 1 seconds
  Then I should see "troisième-quartier"

@database
Scenario: Logged in admin wants to add district without style in project
  When I click the add button
  And I wait 1 seconds
  Then I should see "district_modal.create.title"
  And I wait 1 seconds
  And I fill in the following:
    | projectDistrict.name  | quatrieme-quartier |
  When I submit the modal
  And I wait 1 seconds
  Then I should see "quatrieme-quartier"

@database
Scenario: Logged in admin wants to delete district from project.
  When I click the delete button
  Then I should see "are-you-sure-you-want-to-delete-this-item"
  When I click the confirm delete popover
  And I wait 1 seconds
  Then I should not see "Deuxième Quartier"

@database
Scenario: Logged in admin wants to edit district in project.
  When I click the edit button
  And I wait 1 seconds
  And I fill in the following:
    | projectDistrict.name  | Quartier-modify |
  And I submit the modal
  And I wait 1 seconds
  Then I should see "Quartier-modify"

@projectDistrict
Feature: Project District

Background:
  Given I am logged in as admin
  Then I go to "/admin/capco/app/district-projectdistrict/list"
  And I wait 1 seconds

@database @javascript
Scenario: Loggin admin want to add district in project.
  When I click the ".btn-outline-primary" element
  Then I should see "district_modal.create.title"
  And I wait 1 seconds
  When I click the ".react-toggle" element
  And I fill in the following:
    | projectDistrict.name  | troisième-quartier |
    | projectDistrict.border.size  | 12 |
    | projectDistrict.border.opacity  | 50 |
  When I click the ".saturation-black" element
  When I click the "#js-sumbit-button" element
  And I wait 1 seconds
  Then I should see "troisième-quartier"

@database @javascript
Scenario: Loggin admin want to delete district from project.
  When I click the ".btn-outline-danger" element
  Then I should see "are-you-sure-you-want-to-delete-this-item"
  When I click the "#btn-confirm-delete-field" element
  And I wait 1 seconds
  Then I should not see "Deuxième Quartier"

@database @javascript
Scenario: Loggin admin want to edit district in project.
  When I click the ".btn-outline-warning" element
  And I wait 1 seconds
  And I fill in the following:
    | projectDistrict.name  | Quartier-modify |
  And I click the "#js-sumbit-button" element
  And I wait 1 seconds
  Then I should see "Quartier-modify"

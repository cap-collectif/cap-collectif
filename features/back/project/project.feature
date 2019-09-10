@admin @project
Feature: Projects features

Scenario: Logged in admin wants to test admin project
  Given I am logged in as admin
  And I go to the admin project list page
  And I should not see "error.500"
  And I go to the admin appendix list page
  And I should not see "error.500"
  And I go to the admin source list page
  And I should not see "error.500"
  And I go to the admin consultation list page
  And I should not see "error.500"
  And I go to the admin project type list page
  And I should not see "error.500"
  And I go to the admin proposal list page
  And I should not see "error.500"
  And I go to the admin questionnaire list page
  And I should not see "error.500"

@multiple-windows
Scenario: Logged in admin want to see project from project list
  Given I am logged in as admin
  Then I go to the admin project list page
  And I click the ".sonata-ba-list-field-actions[objectid='project1'] div a" element
  Then I switch to window 1
  And I should be on "/consultation/croissance-innovation-disruption/presentation/presentation-1"
  And I should not see "error.500"
  And I should not see "error.400"

@multiple-windows
Scenario: Logged in admin want to see project from project list
  Given I am logged in as admin
  Then I go to "/admin/capco/app/project/project2/edit"
  And I click the "#action_show" element
  Then I switch to window 1
  And I should be on "/project/strategie-technologique-de-letat-et-services-publics/consultation/collecte-des-avis-pour-une-meilleur-strategie"
  And I should not see "error.404"
  And I should not see "error.500"
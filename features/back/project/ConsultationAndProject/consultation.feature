@admin @project @opinion_type_admin
Feature: Show correctly the consultation form

Scenario: Conditional display of the comment type of a contribution as Admin
  Given I am logged in as admin
  When I go to admin opinion type page with opinionTypeId "opinionType13"
  Then I should not see a "#commentSystem" element

Scenario: Conditional display of the comment type of a contribution as Super Admin
  Given I am logged in as super admin
  When I go to admin opinion type page with opinionTypeId "opinionType13"
  Then I wait "#commentSystem" to appear on current page

Scenario: Conditional display of the voting type of a contribution as Admin
  Given I am logged in as admin
  When I go to admin opinion type page with opinionTypeId "opinionType13"
  Then I should not see a "#voteWidgetType" element

Scenario: Conditional display of the voting type of a contribution as Super Admin
  Given I am logged in as super admin
  When I go to admin opinion type page with opinionTypeId "opinionType13"
  Then I should see a "#voteWidgetType" element

Scenario: Logged in admin wants to see home / sections page list
  Given I am logged in as admin
  When I go to the admin section list page
  Then I should not see "error.500"
  And I should see "section_list"

Scenario: Logged in admin wants to edit a section
  Given I am logged in as admin
  When I go to the admin section page with sectionId "sectionMetrics"
  Then I should not see "error.500"
  And I should not see "error.404"
  And I should see an ".content" element


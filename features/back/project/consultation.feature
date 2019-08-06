@admin @project @opinion_type_admin
Feature: Show correctly the consultation form

Scenario: Conditional display of the comment type of a contribution as Admin
  Given I am logged in as admin
  When I go to admin opinion type page with opinionTypeId "opinionType13"
  Then I should not see a "#sonata-ba-field-container-s6321d9051b_commentSystem" element

Scenario: Conditional display of the comment type of a contribution as Super Admin
  Given I am logged in as super admin
  When I go to admin opinion type page with opinionTypeId "opinionType13"
  Then I should see a "#sonata-ba-field-container-s6321d9051b_commentSystem" element

Scenario: Conditional display of the voting type of a contribution as Admin
  Given I am logged in as admin
  When I go to admin opinion type page with opinionTypeId "opinionType13"
  Then I should not see a "#sonata-ba-field-container-s6321d9051b_voteWidgetType" element

Scenario: Conditional display of the voting type of a contribution as Super Admin
  Given I am logged in as super admin
  When I go to admin opinion type page with opinionTypeId "opinionType13"
  Then I should see a "#sonata-ba-field-container-s6321d9051b_voteWidgetType" element

Scenario: Logged in admin wants to see home / sections page list
  Given I am logged in as admin
  When I go to the admin section list page
  Then I should not see "error.500"
  And I should see "Section List"

Scenario: Logged in admin wants to edit a section
  Given I am logged in as admin
  When I go to the admin section page with sectionId 5
  Then I should not see "error.500"
  And I should not see "error.404"
  And I should see an ".content" element

Scenario: An admin wants to create a consultation
  Given I am logged in as admin
  When I go to the admin consultation creation page
  And I fill in the following:
    | admin.fields.consultation.title | Ma belle consultation |
  And I click the "button[name='btn_create_and_edit']" element
  And I should see "flash_create_success"

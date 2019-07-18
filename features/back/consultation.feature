@opinion_type_admin
Feature: Show correctly the consultation form

Scenario: Conditional display of the comment type of a contribution as Admin
  Given I am logged in as admin
  When I go to admin opinion type page with opinionTypeId "opinionType13"
  Then I should not see a "#sonata-ba-field-container-s6321d9051b_commentSystem" element

Scenario: Conditional display of the comment type of a contribution as Super Admin
  Given I am logged in as super admin
  When I go to admin opinion type page with opinionTypeId "opinionType13"
  Then I should see a "#sonata-ba-field-container-s6321d9051b_commentSystem" element

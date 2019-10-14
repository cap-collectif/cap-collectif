@core @homepage
Feature: Homepage

@parallel-scenario
Scenario: Can see sections
  Given I visited "home page"
  Then I should see "Section activée"
  And I should not see "Section désactivée"

Scenario: Can see limited projects with button more projects
  Given feature "themes" is enabled
  Given I visited "home page"
  And I wait ".project-preview" to appear on current page
  Then I should see 4 ".project-preview" elements
  And I should see 1 ".see-more-projects-button" elements

@database
Scenario: Can see the links associated with features when they are enabled
  Given I am logged in as super admin
  Given feature "developer_documentation" is disabled
  Then I go to "/admin/features/developer_documentation/switch"
  Given I visited "home page"
  And I wait ".footer__links" to appear on current page
  Then I should see "Développeurs"

@database
Scenario: Can't see the links associated with features when they are disabled
  Given I am logged in as super admin
  Given feature "developer_documentation" is enabled
  Then I go to "/admin/features/developer_documentation/switch"
  And I visited "home page"
  And I wait ".footer__links" to appear on current page
  Then I should not see "Développeurs"

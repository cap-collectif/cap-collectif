@core
Feature: Homepage

@parallel-scenario
Scenario: Can see sections
  Given I visited "home page"
  Then I should see "Section activée"
  And I should not see "Section désactivée"

@stats
Feature: Stats

  @javascript
  Scenario: Anonymous user wants to see project stats
    Given I go to a project stats page
    Then I should see theme stats
    And I should see district stats
    And I should see user types stats

  @javascript
  Scenario: Anonymous user wants to filter stats
    Given I go to a project stats page
    When I filter votes stats by theme
    Then the votes stats should be filtered by theme
    And I filter votes stats by district
    Then the votes stats should be filtered by theme and district

  @javascript
  Scenario: Anonymous user wants to see all districts
    Given I go to a project stats page
    When I click the show all districts stats button
    Then I should see all districts stats

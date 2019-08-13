@core @stats
Feature: Stats

Scenario: Anonymous user wants to see project stats
  Given I go to a project stats page
  Then I should see theme stats
  And I should see district stats
  And I should see user types stats

Scenario: Anonymous user wants to filter votes stats
  Given I go to a project stats page
  And I go to the selection step stats
  Then I should see votes stats
  And I filter votes stats by category
  Then the votes stats should be filtered by category and I should see 0 items

Scenario: Anonymous user wants to see all districts
  Given I go to a project stats page
  When I click the show all districts stats button
  Then I should see all districts stats

@bp @proposal_search
Feature: Proposals search

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and apply filters
  Given features themes, districts are enabled
  And I go to an open collect step
  Then there should be 7 proposals
  And I change the proposals theme filter
  Then there should be 5 proposals

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and apply status filters
  Given features themes, districts are enabled
  And I go to an open collect step
  Then there should be 7 proposals
  And I change the proposals status filter to "status2"
  Then there should be 1 proposals
  And I change the proposals status filter to "status1"
  Then there should be 4 proposals

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and apply contributor type filters
  Given features themes, districts, user_type are enabled
  And I go to an open collect step
  Then there should be 7 proposals
  And I change the proposals contributor type filter to "1"
  Then there should be 7 proposals
  And I change the proposals contributor type filter to "4"
  Then there should be 0 proposals

@elasticsearch
Scenario: Anonymous user wants to see proposals in a private collect step
  Given I go to a private open collect step
  Then there should be 0 proposals

@elasticsearch
Scenario: Logged in user wants to see its proposals in a private collect step
  Given I am logged in as user
  And I go to a private open collect step
  Then there should be 2 proposals

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and sort them
  Given I go to an open collect step
  Then proposals should be ordered randomly
  When I sort proposals by date
  Then proposal "Proposition pas encore votable" should be before proposal "Ravalement de la façade de la bibliothèque municipale"
  When I sort proposals by comments
  Then proposals should be ordered by comments

@elasticsearch
Scenario: Anonymous user wants to see last proposals when he returns on the list of proposals
  Given I go to an open collect step
  Then proposals should be ordered randomly
  When I save current proposals
  Then I go to an open collect step
  When proposals should be ordered randomly
  Then I should see same proposals

@elasticsearch
Scenario: Anonymous user wants to search a proposal with the random filter
  Given I go to an open collect step
  Then proposals should be ordered randomly
  When I search for proposals with terms "plantation"
  Then I should not see random row

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and search by term
  Given I go to an open collect step
  Then there should be 7 proposals
  When I search for proposals with terms "proposition"
  Then there should be 2 proposals
  Then proposals should be filtered by terms

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and search by reference
  Given I go to an open collect step
  Then there should be 7 proposals
  When I search for proposals with terms "1-7"
  Then there should be 1 proposals
  Then proposals should be filtered by references

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and search by term but find no ones
  Given I go to an open collect step
  Then there should be 7 proposals
  When I search for proposals with terms "toto"
  Then there should be 0 proposals
  Then proposals should have no results

@elasticsearch
Scenario: Anonymous user combine search, filters and sorting on proposals in a collect step
  Given features themes, districts are enabled
  And I am logged in as user
  And I go to an open collect step
  Then there should be 7 proposals
  When I sort proposals by comments
  And I search for proposals with terms "proposition"
  Then there should be 2 proposals
  Then proposals should be filtered by theme and terms and sorted by comments

Scenario: Anonymous user wants to see proposals likers
  Given I go to an open collect step
  Then I should see the proposal likers

@elasticsearch
Scenario: Anonymous user wants to see proposals in a selection step and apply filters
  Given feature "themes" is enabled
  When I go to a selection step with simple vote enabled
  Then there should be 3 proposals
  And I change the proposals theme filter
  Then there should be 2 proposals

@elasticsearch
Scenario: Anonymous user wants to see proposals in a selection step and sort them
  Given I go to a selection step with simple vote enabled
  Then proposals should be ordered randomly
  When I sort proposals by date
  Then proposal "Rénovation du gymnase" should be before proposal "Ravalement de la façade de la bibliothèque municipale"
  When I sort proposals by comments
  Then proposals should be ordered by comments

@elasticsearch
Scenario: Anonymous user wants to see saved proposals when he returns on the selection of proposals
  Given I go to a selection step
  Then proposals should be ordered randomly
  When I save current proposals
  Then I go to a selection step
  When proposals should be ordered randomly
  Then I should see same proposals

@elasticsearch
Scenario: Anonymous user want to show a proposal without actuality
  Given I go to a proposal not yet votable
  Then I should not see an "#proposal-page-tabs-tab-blog" element

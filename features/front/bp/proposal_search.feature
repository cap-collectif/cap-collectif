@bp @proposal_search
Feature: Proposals step filters and search

Scenario: Initialize filters from URL parameters
  Given features user_type, districts are enabled
  And I am logged in as admin
  And I go to "/project/budget-participatif-idf/collect/collecte-des-projets-idf-privee?category=pCategoryIdf1&district=RGlzdHJpY3Q6ZGlzdHJpY3RJZGYy&status=statusIdfCollect1&type=VXNlclR5cGU6NA=="
  Then The proposals category filter option "Espaces verts et biodiversité" should be selected
  Then The proposals district filter option "Val de marne (94)" should be selected
  Then The proposals status filter option "Nouveau projet" should be selected
  Then The proposals contributor filter option "Institution" should be selected
  Then there should be 0 proposals

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and apply filters
  Given features themes, districts are enabled
  And I go to an open collect step
  Then there should be 8 proposals
  And I change the proposals theme filter
  Then there should be 5 proposals

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and apply status filters
  Given features themes, districts are enabled
  And I go to an open collect step
  Then there should be 8 proposals
  And I change the proposals status filter to "status2"
  Then there should be 2 proposals
  And I change the proposals status filter to "status1"
  Then there should be 4 proposals

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and apply contributor type filters
  Given features themes, districts, user_type are enabled
  And I go to an open collect step
  Then there should be 8 proposals
  And I change the proposals contributor type filter to "VXNlclR5cGU6MQ=="
  Then there should be 8 proposals
  And I change the proposals contributor type filter to "VXNlclR5cGU6NA=="
  Then there should be 0 proposals

@elasticsearch
Scenario: Anonymous user wants to see proposals in a private collect step
  Given I go to a private open collect step
  Then there should be 0 proposals

@security
Scenario: Anonymous user wants to see a private proposal not in selection step
  Given I go to "/projects/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-projet-qui-ne-sera-pas-analyse"
  And I should see "unauthorized-access"

@security
Scenario: Anonymous user wants to see a private proposal in selection step
  Given I go to "/projects/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-projet-local-en-tant-quentreprise"
  And I should not see "unauthorized-access"

@security
Scenario: Logged in user wants to see a private proposal not in selection step
  Given I am logged in as user
  Given I go to "/projects/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-projet-qui-ne-sera-pas-analyse"
  And I should see "unauthorized-access"

@security
Scenario: Logged in user wants to see a private proposal not in selection step
  Given I am logged in as theo
  Given I go to "/projects/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-projet-qui-ne-sera-pas-analyse"
  And I should see "unauthorized-access"

@security
Scenario: Logged in user wants to see a private proposal not in selection step
  Given I am logged in as admin
  Given I go to "/projects/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-projet-qui-ne-sera-pas-analyse"
  And I should not see "unauthorized-access"

@security
Scenario: Anonymous user wants to see a proposal in a private collect step
  Given I go to "/projects/budget-participatif-rennes/collect/collecte-des-propositions-privee/proposals/proposition-plus-votable-1"
  And I should see "unauthorized-access"

@security
Scenario: Logged in user wants to see my proposal in a private collect step
  Given I am logged in as user
  And I go to "/projects/budget-participatif-rennes/collect/collecte-des-propositions-privee/proposals/proposition-plus-votable-1"
  And I should not see "unauthorized-access"

@security
Scenario: Logged in admin wants to see a proposal in a private collect step
  Given I am logged in as admin
  And I go to "/projects/budget-participatif-rennes/collect/collecte-des-propositions-privee/proposals/proposition-plus-votable-1"
  And I should not see "unauthorized-access"

@security
Scenario: Logged in project admin wants to see a proposal in a private collect step
  Given I am logged in as theo
  And I go to "/projects/budget-participatif-idf/collect/collecte-des-projets-idf-privee/proposals/mon-grand-projet"
  And I should not see "unauthorized-access"

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
  Then proposals should be ordered by date  
  When I sort proposals by comments
  Then proposals should be ordered by comments

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and search by term
  Given I go to an open collect step
  Then there should be 8 proposals
  When I search for proposals with terms "proposition"
  Then there should be 2 proposals
  Then proposals should be filtered by terms

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and search by reference
  Given I go to an open collect step
  Then there should be 8 proposals
  When I search for proposals with terms "1-7"
  Then there should be 1 proposals
  Then proposals should be filtered by references

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and search by term but find no ones
  Given I go to an open collect step
  Then there should be 8 proposals
  When I search for proposals with terms "toto"
  Then there should be 0 proposals
  Then proposals should have no results

@elasticsearch
Scenario: Anonymous user combine search, filters and sorting on proposals in a collect step
  Given features themes, districts are enabled
  And I am logged in as user
  And I go to an open collect step
  Then there should be 8 proposals
  When I sort proposals by comments
  And I search for proposals with terms "proposition"
  Then there should be 2 proposals
  Then proposals should be filtered by theme and terms and sorted by comments

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
  Then proposals should be ordered by date  
  When I sort proposals by comments
  Then proposals should be ordered by comments

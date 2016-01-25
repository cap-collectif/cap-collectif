@proposals
Feature: Proposals

  # Collect step : See proposals with filters, sorting and search term

  @javascript @elasticsearch
  Scenario: Anonymous user wants to see proposals in a collect step and apply filters
    Given feature "themes" is enabled
    And I go to an open collect step
    Then there should be 4 proposals
    And I change the theme filter
    Then there should be 3 proposals

  @javascript @elasticsearch
  Scenario: Anonymous user wants to see proposals in a collect step and sort them
    Given I go to an open collect step
    Then proposals should be ordered by date
    When I sort by comments
    Then proposals should be ordered by comments

  @javascript @elasticsearch
  Scenario: Anonymous user wants to see proposals in a collect step and search by term
    Given I go to an open collect step
    Then there should be 4 proposals
    When I search for proposals with terms "gymnase banc"
    Then there should be 2 proposals
    Then proposals should be filtered by terms

  @javascript @elasticsearch
  Scenario: Anonymous user combine search, filters and sorting on proposals in a collect step
    Given feature "themes" is enabled
    And I am logged in as user
    And I go to an open collect step
    Then there should be 4 proposals
    When I sort by comments
    And I search for proposals with terms "bibliothèque banc"
    And I change the theme filter
    Then there should be 2 proposals
    Then proposals should be filtered by theme and terms and sorted by comments

  # CRUD

  @database @javascript @elasticsearch
  Scenario: Logged in user wants to create a proposal
    Given I am logged in as user
    And I go to an open collect step
    Then there should be 4 proposals
    When I click the create proposal button
    And I fill the proposal form
    And I submit the create proposal form
    Then I should see "Merci ! Votre proposition a bien été créée."
    Then there should be 5 proposals
    And I should see my new proposal

  @database @javascript @elasticsearch
  Scenario: Logged in user wants to create a proposal with theme
    Given feature "themes" is enabled
    And I am logged in as user
    And I go to an open collect step
    Then there should be 4 proposals
    When I click the create proposal button
    And I fill the proposal form with a theme
    And I submit the create proposal form
    Then I should see "Merci ! Votre proposition a bien été créée."
    And there should be 5 proposals
    And I should see my new proposal

  @javascript @security
  Scenario: Logged in user wants to create a proposal without providing required response
    Given I am logged in as user
    And I go to an open collect step
    When I click the create proposal button
    And I fill the proposal form without required response
    And I submit the create proposal form
    Then I should see "Ce champ est obligatoire."

  @javascript @security
  Scenario: Logged in user wants to create a proposal in closed collect step
    Given I am logged in as user
    And I go to a closed collect step
    Then I should see "Dépôt terminé. Merci à tous d'avoir contribué."
    And the create proposal button should be disabled

  @javascript @security
  Scenario: Anonymous user wants to create a proposal
    Given I go to an open collect step
    When I click the create proposal button
    Then I should see "Vous devez être connecté pour réaliser cette action."

  @javascript @database
  Scenario: Author of a proposal wants to update it
    Given I am logged in as user
    And I go to a proposal
    When I click the edit proposal button
    And I change the proposal title
    And I submit the edit proposal form
    Then I should see "Votre proposition a bien été modifiée."
    And the proposal title should have changed

  @javascript
  Scenario: Non author of a proposal wants to update it
    Given I am logged in as admin
    And I go to a proposal
    Then I should not see the edit proposal button

  @javascript @database @elasticsearch
  Scenario: Author of a proposal wants to delete it
    Given I am logged in as user
    And I go to an open collect step
    Then there should be 4 proposals
    And I go to a proposal
    When I click the delete proposal button
    And I confirm proposal deletion
    Then there should be 3 proposals
    And I should not see my proposal anymore

  @javascript
  Scenario: Non author of a proposal wants to delete it
    Given I am logged in as admin
    And I go to a proposal
    Then I should not see the delete proposal button


  # Reporting

  @javascript @database @circle
  Scenario: Logged in user wants to report a proposal
    Given feature "reporting" is enabled
    And I am logged in as admin
    And I go to a proposal
    When I click the report proposal button
    And I fill the reporting form
    And I submit the reporting form
    Then I should see "Merci ! Votre signalement a bien été pris en compte."


  # Selection step : See proposals with filters, sorting and search term

  @javascript @elasticsearch
  Scenario: Anonymous user wants to see proposals in a selection step and apply filters
    Given I go to a selection step with simple vote enabled
    Then there should be 3 proposals
    And I change the theme filter
    Then there should be 2 proposals

  @javascript @elasticsearch
  Scenario: Anonymous user wants to see proposals in a selection step and sort them
    Given I go to a selection step with simple vote enabled
    Then proposals should be ordered by date
    When I sort by comments
    Then proposals should be ordered by comments

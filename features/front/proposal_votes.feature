@proposal_votes
Feature: Proposal votes

  # Votes from selection step page

  @javascript @database @elasticsearch @votes_from_selection_step
  Scenario: Logged in user wants to vote and unvote for a proposal in a selection step with a comment
    Given I am logged in as user
    And I go to a selection step with simple vote enabled
    And the proposal has 3 votes
    When I click the proposal vote button
    And I add a proposal vote comment
    And I submit the proposal vote form
    And I should see "Merci, votre vote a bien été pris en compte."
    Then the proposal should have 4 votes
    Then I click the proposal unvote button
    And I should see "Merci, votre vote a bien été supprimé."
    Then the proposal should have 3 votes

  @javascript @database @elasticsearch @votes_from_selection_step
  Scenario: Anonymous user wants to vote for a proposal in a selection step with a comment
    Given I go to a selection step with simple vote enabled
    When I click the proposal vote button
    And I fill the proposal vote form
    And I add a proposal vote comment
    And I submit the proposal vote form
    And I should see "Merci, votre vote a bien été pris en compte."

  @javascript @database @elasticsearch @votes_from_selection_step
  Scenario: Anonymous user wants to vote for a proposal in a selection step anonymously
    Given I go to a selection step with simple vote enabled
    When I click the proposal vote button
    And I fill the proposal vote form
    And I check the proposal vote private checkbox
    And I submit the proposal vote form
    And I should see "Merci, votre vote a bien été pris en compte."

  @javascript @elasticsearch @votes_from_selection_step
  Scenario: Anonymous user wants to vote twice with the same email in a selection step
    Given I go to a selection step with simple vote enabled
    When I click the proposal vote button
    And I fill the proposal vote form with already used email
    And I submit the proposal vote form
    Then I should see "Vous avez déjà voté pour cette proposition."

  @javascript @elasticsearch @security @votes_from_selection_step
  Scenario: Anonymous user wants to vote in a selection step with an email already associated to an account
    Given I go to a selection step with simple vote enabled
    When I click the proposal vote button
    And I fill the proposal vote form with a registered email
    And I submit the proposal vote form
    Then I should see "Cette adresse électronique est déjà associée à un compte. Veuillez vous connecter pour soutenir cette proposition."

  @javascript @security @elasticsearch @votes_from_selection_step
  Scenario: Logged in user wants to vote when he has not enough credits left in a selection step
    Given I am logged in as admin
    When I go to a selection step with budget vote enabled
    Then the proposal vote button must be disabled
    # Hovering still not working
    # And I should see the proposal vote tooltip

  @javascript @security @elasticsearch @votes_from_selection_step
  Scenario: Anonymous user wants to vote on a selection step that has budget vote in a selection step
    When I go to a selection step with budget vote enabled
    And I click the proposal vote button
    Then I should see "Vous devez être connecté pour réaliser cette action."

  @javascript @security @elasticsearch @votes_from_selection_step
    Scenario: Anonymous user wants to vote on a selection step that is not open yet
    When I go to a selection step not yet open
    Then the proposal should have 0 votes
    And the proposal vote button must be disabled

  @javascript @security @elasticsearch @votes_from_selection_step
  Scenario: Anonymous user wants to vote on a selection step that is closed
    When I go to a closed selection step
    Then the proposal should have 1 votes
    And the proposal vote button must be disabled

  # Votes from proposal page

  @javascript @database @votes_from_proposal
  Scenario: Logged in user wants to vote and unvote for a proposal with a comment
    Given I am logged in as user
    And I go to a proposal
    And the proposal has 3 votes
    And the proposal has 0 comments
    And I click the proposal vote button
    And I add a proposal vote comment
    And I submit the proposal vote form
    Then I should see "Merci, votre vote a bien été pris en compte"
    And the proposal should have 4 votes
    And the proposal should have 1 comments
    And I go to the proposal votes tab
    And I should see my vote in the proposal votes list
    When I click the proposal unvote button
    Then I should see "Merci, votre vote a bien été supprimé."
    And the proposal should have 3 votes
    And I should not see my vote in the proposal votes list

  @javascript @database @votes_from_proposal
  Scenario: Logged in user wants to vote for a proposal anonymously
    Given I am logged in as user
    And I go to a proposal
    And the proposal has 3 votes
    When I click the proposal vote button
    And I check the proposal vote private checkbox
    And I submit the proposal vote form
    Then I should see "Merci, votre vote a bien été pris en compte"
    And the proposal should have 4 votes
    And I go to the proposal votes tab
    And I should see my anonymous vote in the proposal votes list

  @javascript @database @votes_from_proposal
  Scenario: Anonymous user wants to vote for a proposal with a comment
    Given I go to a proposal
    And the proposal has 3 votes
    And the proposal has 0 comments
    When I click the proposal vote button
    And I fill the proposal vote form
    And I add a proposal vote comment
    And I submit the proposal vote form
    Then I should see "Merci, votre vote a bien été pris en compte"
    And the proposal should have 4 votes
    And I go to the proposal comments tab
    And I should see my comment in the proposal comments list
    And I go to the proposal votes tab
    And I should see my not logged in vote in the proposal votes list

  @javascript @elasticsearch @database @votes_from_proposal
  Scenario: Anonymous user wants to vote for a proposal anonymously
    Given I go to a proposal
    And the proposal has 3 votes
    When I click the proposal vote button
    And I fill the proposal vote form
    And I check the proposal vote private checkbox
    And I submit the proposal vote form
    Then I should see "Merci, votre vote a bien été pris en compte"
    And the proposal should have 4 votes
    And I go to the proposal votes tab
    And I should see my anonymous vote in the proposal votes list

  @javascript @security @votes_from_proposal
  Scenario: Anonymous user wants to vote twice with the same email
    Given I go to a proposal
    And the proposal has 3 votes
    When I click the proposal vote button
    And I fill the proposal vote form with already used email
    And I submit the proposal vote form
    Then I should see "Vous avez déjà voté pour cette proposition."

  @javascript @security @votes_from_proposal
  Scenario: Anonymous user wants to vote with an email already associated to an account
    Given I go to a proposal
    And the proposal has 3 votes
    When I click the proposal vote button
    And I fill the proposal vote form with a registered email
    And I submit the proposal vote form
    Then I should see "Cette adresse électronique est déjà associée à un compte. Veuillez vous connecter pour soutenir cette proposition."

  @javascript @security @votes_from_proposal
  Scenario: Logged in user wants to vote when he has not enough credits left
    Given I am logged in as admin
    When I go to a proposal with budget vote enabled
    Then the proposal vote button must be disabled
    # Hovering not working
    # And I hover over the proposal vote button
    # And I should see "Pas assez de crédits. Désélectionnez un projet ou sélectionnez un projet moins coûteux."

  @javascript @security @votes_from_proposal
  Scenario: Anonymous user wants to vote on a selection step that has budget vote
    Given I go to a proposal with budget vote enabled
    When I click the proposal vote button

  @javascript @security @votes_from_proposal
  Scenario: Anonymous user wants to vote for a proposal that is not votable yet
    Given I go to a proposal not yet votable
    Then the proposal vote button must be disabled

  @javascript @security @votes_from_proposal
  Scenario: Anonymous user wants to vote for a proposal that is not votable anymore
    Given I go to a proposal not votable anymore
    Then the proposal vote button must be disabled

  # Votes page
  @javascript @database
  Scenario: Logged in user wants to see his votes on a project and remove one
    Given I am logged in as admin
    When I go to the votes details page
    Then I should have 1 votes
    And I should see "1 proposition sélectionnée"
    # And I remove the first vote
    # Then I should see "Merci, votre vote a bien été supprimé"
    # And I should see "0 proposition sélectionnée"
    # And I should have 0 votes

@proposal_votes
Feature: Proposal votes

  # Votes from selection step page

  @javascript @database @elasticsearch
  Scenario: Logged in user wants to vote and unvote for a proposal in a selection step
    Given I am logged in as user
    And I go to a selection step with simple vote enabled
    And the proposal has 3 votes
    When I click the proposal vote button
    And I should see "Merci, votre vote a bien été pris en compte."
    Then the proposal should have 4 votes
    Then I click the proposal unvote button
    And I should see "Merci, votre vote a bien été supprimé."
    Then the proposal should have 3 votes

  @javascript @database @elasticsearch
  Scenario: Anonymous user wants to vote for a proposal in a selection step with a comment
    Given I go to a selection step with simple vote enabled
    When I click the proposal vote button
    And I fill the proposal vote form
    And I add a proposal vote comment
    And I submit the proposal vote form
    And I should see "Merci, votre vote a bien été pris en compte."

  @javascript @database @elasticsearch
  Scenario: Anonymous user wants to vote for a proposal in a selection step anonymously
    Given I go to a selection step with simple vote enabled
    When I click the proposal vote button
    And I fill the proposal vote form
    And I check the proposal vote private checkbox
    And I submit the proposal vote form
    And I should see "Merci, votre vote a bien été pris en compte."

  @javascript @elasticsearch
  Scenario: Anonymous user wants to vote twice with the same email in a selection step
    Given I go to a selection step with simple vote enabled
    When I click the proposal vote button
    And I fill the proposal vote form with already used email
    And I submit the proposal vote form
    Then I should see "Vous avez déjà voté pour cette proposition."

  @javascript @elasticsearch @security
  Scenario: Anonymous user wants to vote in a selection step with an email already associated to an account
    Given I go to a selection step with simple vote enabled
    When I click the proposal vote button
    And I fill the proposal vote form with a registered email
    And I submit the proposal vote form
    Then I should see "Cette adresse électronique est déjà associée à un compte. Veuillez vous connecter pour soutenir cette proposition."

  @javascript @security @elasticsearch
  Scenario: Logged in user wants to vote when he has not enough credits left in a selection step
    Given I am logged in as admin
    When I go to a selection step with budget vote enabled
    Then the proposal vote button must be disabled
    # Hovering still not working
    # And I should see the proposal vote tooltip

  @javascript @security @elasticsearch
  Scenario: Anonymous user wants to vote on a selection step that has budget vote in a selection step
    When I go to a selection step with budget vote enabled
    And I click the proposal vote button
    Then I should see "Vous devez être connecté pour réaliser cette action."

  @javascript @security @elasticsearch
    Scenario: Anonymous user wants to vote on a selection step that is not open yet
    When I go to a selection step not yet open
    Then the proposal should have 0 votes
    And the proposal vote button must be disabled

  @javascript @security @elasticsearch
  Scenario: Anonymous user wants to vote on a selection step that is closed
    When I go to a closed selection step
    Then the proposal should have 1 votes
    And the proposal vote button must be disabled

  # Votes from proposal page

  @javascript @database
  Scenario: Logged in user wants to vote and unvote for a proposal with a comment
    Given I am logged in as user
    And I go to a proposal
    And the proposal has 3 votes
    When I add a proposal vote comment
    And I submit the proposal vote form
    And I should see "Merci, votre vote a bien été pris en compte"
    Then the proposal should have 4 votes
    And I should see my comment in the proposal comments list
    And I should see my vote in the proposal votes list
    And I submit the proposal vote form
    And I should see "Merci, votre vote a bien été supprimé."
    Then the proposal should have 3 votes
    And I should not see my vote in the proposal votes list

  @javascript @database
  Scenario: Logged in user wants to vote for a proposal anonymously
    Given I am logged in as user
    And I go to a proposal
    And the proposal has 3 votes
    When I check the proposal vote private checkbox
    And I submit the proposal vote form
    Then the proposal should have 4 votes
    And I should see my anonymous vote in the proposal votes list
    And I should see "Merci, votre vote a bien été pris en compte"

  @javascript @database
  Scenario: Anonymous user wants to vote for a proposal with a comment
    Given I go to a proposal
    And the proposal has 3 votes
    And the proposal has 0 comments
    When I fill the proposal vote form
    And I add a proposal vote comment
    And I submit the proposal vote form
    Then the proposal should have 4 votes
    And I should see my comment in the proposal comments list
    And I should see my not logged in vote in the proposal votes list
    And I should see "Merci, votre vote a bien été pris en compte"

  @javascript @database
  Scenario: Anonymous user wants to vote for a proposal anonymously
    Given I go to a proposal
    And the proposal has 3 votes
    When I fill the proposal vote form
    And I check the proposal vote private checkbox
    And I submit the proposal vote form
    Then the proposal should have 4 votes
    And I should see my anonymous vote in the proposal votes list
    And I should see "Merci, votre vote a bien été pris en compte"

  @javascript @security
  Scenario: Anonymous user wants to vote twice with the same email
    Given I go to a proposal
    And the proposal has 3 votes
    When I fill the proposal vote form with already used email
    And I submit the proposal vote form
    Then I should see "Vous avez déjà voté pour cette proposition."

  @javascript @security
  Scenario: Anonymous user wants to vote with an email already associated to an account
    Given I go to a proposal
    And the proposal has 3 votes
    When I fill the proposal vote form with a registered email
    And I submit the proposal vote form
    Then I should see "Cette adresse électronique est déjà associée à un compte. Veuillez vous connecter pour soutenir cette proposition."

  @javascript @security
  Scenario: Logged in user wants to vote when he has not enough credits left
    Given I am logged in as admin
    When I go to a proposal with budget vote enabled
    Then the proposal vote button must be disabled
    And I should see "Pas assez de crédits. Désélectionnez un projet ou sélectionnez un projet moins coûteux."

  @javascript @security
  Scenario: Anonymous user wants to vote on a selection step that has budget vote
    When I go to a proposal with budget vote enabled
    Then I should see "Vous devez vous connecter pour pouvoir voter pour cette proposition."
    When I submit the proposal vote form
    Then I should see "Vous devez être connecté pour réaliser cette action."

  # Votes page
  @javascript @database
  Scenario: Logged in user wants to see his votes on a project and remove one
    Given I am logged in as user
    When I go to the votes details page
    Then I should have 2 votes
    And I should see "2 propositions sélectionnées"
    And I remove the first vote
    Then I should see "Merci, votre vote a bien été supprimé"
    And I should see "1 proposition sélectionnée"
    And I should have 1 votes

  @javascript @security
  Scenario: Anonymous user wants to vote for a proposal that is not votable yet
    Given I go to a proposal not yet votable
    Then the proposal vote button must be disabled
    And I should see "L'étape de sélection n'est pas encore ouverte aux votes. Revenez plus tard !"

  @javascript @security
  Scenario: Anonymous user wants to vote for a proposal that is not votable anymore
    Given I go to a proposal not votable anymore
    Then the proposal vote button must be disabled
    And I should see "L'étape de sélection est terminée, merci pour votre participation."

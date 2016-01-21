@proposal_votes
Feature: Proposal votes

  # Votes from selection step page

  @javascript @database @elasticsearch
  Scenario: Logged in user wants to vote and unvote for a proposal in a selection step
    Given I am logged in as user
    And I visited "selection page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | selection                        |
    And I wait 1 seconds
    Then I should see "3" in the "#proposal-2 .proposal__counter--votes .proposal__counter__value" element
    And I should see "Soutenir" in the "#proposal-2" element
    When I click the "#proposal-2 .proposal__preview__vote" element
    And I wait 1 seconds
    Then I should see "4" in the "#proposal-2 .proposal__counter--votes .proposal__counter__value" element
    And I should see "Annuler mon soutien" in the "#proposal-2" element
    And I should see "Merci, votre vote a bien été pris en compte."
    When I click the "#proposal-2 .proposal__preview__vote" element
    And I wait 1 seconds
    Then I should see "3" in the "#proposal-2 .proposal__counter--votes .proposal__counter__value" element
    And I should see "Soutenir" in the "#proposal-2" element
    And I should see "Merci, votre vote a bien été supprimé."

  @javascript @database @elasticsearch
  Scenario: Anonymous user wants to vote for a proposal in a selection step with a comment
    Given I visited "selection page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | selection                        |
    And I wait 1 seconds
    Then I should see "3" in the "#proposal-2 .proposal__counter--votes .proposal__counter__value" element
    And I should see "0" in the "#proposal-2 .proposal__counter--comments .proposal__counter__value" element
    And I should see "Soutenir" in the "#proposal-2" element
    When I click the "#proposal-2 .proposal__preview__vote" element
    And I wait 1 seconds
    And I fill in the following:
      | proposal-vote__username   | test                |
      | proposal-vote__email      | test@coucou.fr      |
      | proposal-vote__comment    | Coucou !            |
    And I press "confirm-proposal-vote"
    And I wait 1 seconds
    Then I should see "4" in the "#proposal-2 .proposal__counter--votes .proposal__counter__value" element
    And I should see "1" in the "#proposal-2 .proposal__counter--comments .proposal__counter__value" element
    And I should see "Soutenir" in the "#proposal-2" element
    And I should see "Merci, votre vote a bien été pris en compte."

  @javascript @database @elasticsearch
  Scenario: Anonymous user wants to vote for a proposal in a selection step anonymously
    Given I visited "selection page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | selection                        |
    And I wait 1 seconds
    Then I should see "3" in the "#proposal-2 .proposal__counter--votes .proposal__counter__value" element
    And I should see "0" in the "#proposal-2 .proposal__counter--comments .proposal__counter__value" element
    And I should see "Soutenir" in the "#proposal-2" element
    When I click the "#proposal-2 .proposal__preview__vote" element
    And I wait 1 seconds
    And I fill in the following:
      | proposal-vote__username   | test                |
      | proposal-vote__email      | test@coucou.fr      |
    And I check "proposal-vote__private"
    And I press "confirm-proposal-vote"
    And I wait 1 seconds
    Then I should see "4" in the "#proposal-2 .proposal__counter--votes .proposal__counter__value" element
    And I should see "0" in the "#proposal-2 .proposal__counter--comments .proposal__counter__value" element
    And I should see "Soutenir" in the "#proposal-2" element
    And I should see "Merci, votre vote a bien été pris en compte."

  @javascript @elasticsearch
  Scenario: Anonymous user wants to vote twice with the same email from a selection step
    Given I visited "selection page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | selection                        |
    And I wait 1 seconds
    When I click the "#proposal-2 .proposal__preview__vote" element
    And I wait 1 seconds
    And I fill in the following:
      | proposal-vote__username   | test                |
      | proposal-vote__email      | cheater@test.com       |
      | proposal-vote__comment    | Coucou !            |
    And I press "confirm-proposal-vote"
    And I wait 1 seconds
    Then I should see "Vous avez déjà voté pour cette proposition."

  @javascript @security @elasticsearch
  Scenario: Logged in user wants to vote when he has not enough credits left from a selection step
    Given I am logged in as admin
    When I visited "selection page" with:
      | projectSlug | projet-avec-budget                    |
      | stepSlug    | selection-avec-vote-selon-le-budget   |
    And I wait 1 seconds
    Then "#proposal-8 .proposal__preview__vote" element should have class "disabled"
  # Hovering does not work properly. To fix later
  #  And I hover over the "#proposal-1 .proposal__preview__vote" element
  #  And I wait 1 seconds
  #  Then I should see "Pas assez de crédits. Désélectionnez un projet ou sélectionnez un projet moins coûteux."

  @javascript @security @elasticsearch
  Scenario: Anonymous user wants to vote on a selection step that has budget vote from a selection step
    When I visited "selection page" with:
      | projectSlug | projet-avec-budget                   |
      | stepSlug    | selection-avec-vote-selon-le-budget  |
    And I wait 1 seconds
    And I click the "#proposal-8 .proposal__preview__vote" element
    And I wait 1 seconds
    Then I should see "Vous devez être connecté pour réaliser cette action."

  # Votes from proposal page

  @javascript @database
  Scenario: Logged in user wants to vote and unvote for a proposal with a comment
    Given I am logged in as user
    When I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes       |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 1 seconds
    Then I should see "3" in the ".proposal__info--votes .value" element
    And I fill in the following:
     | proposal-vote__comment    | Coucou, je suis un nouveau commentaire !  |
    And I press "Soutenir"
    And I wait 1 seconds
    Then I should see "4" in the ".proposal__info--votes .value" element
    And I should see "Coucou, je suis un nouveau commentaire !" in the ".proposal__comments" element
    And I should see "user" in the ".proposal__vote:nth-child(1)" element
    And I should see "Merci, votre vote a bien été pris en compte"
    And I press "Annuler mon soutien"
    And I wait 1 seconds
    Then I should see "3" in the ".proposal__info--votes .value" element
    And I should not see "user" in the ".proposal__vote:nth-child(1)" element
    And I should see "Merci, votre vote a bien été supprimé."

  @javascript @database
  Scenario: Logged in user wants to vote for a proposal anonymously
    Given I am logged in as user
    When I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes       |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 1 seconds
    Then I should see "3" in the ".proposal__info--votes .value" element
    And I check "proposal-vote__private"
    And I press "Soutenir"
    And I wait 1 seconds
    Then I should see "4" in the ".proposal__info--votes .value" element
    And I should see "Annuler mon soutien"
    And I should see "Anonyme" in the ".proposal__vote:nth-child(1)" element
    And I should see "Merci, votre vote a bien été pris en compte"

  @javascript @database
  Scenario: Anonymous user wants to vote for a proposal with a comment
    When I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes       |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 1 seconds
    Then I should see "3" in the ".proposal__info--votes .value" element
    And I should see "0" in the ".proposal__info--comments .value" element
    And I fill in the following:
      | proposal-vote__username   | test                                      |
      | proposal-vote__email      | test@coucou.fr                            |
      | proposal-vote__comment    | Coucou, je suis un nouveau commentaire !  |
    And I press "Soutenir"
    And I wait 3 seconds
    Then I should see "4" in the ".proposal__info--votes .value" element
    And I should see "Coucou, je suis un nouveau commentaire !" in the ".proposal__comments" element
    And I should see "test" in the ".proposal__vote:nth-child(1)" element
    And I should see "Merci, votre vote a bien été pris en compte"

  @javascript @database
  Scenario: Anonymous user wants to vote for a proposal anonymously
    When I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes       |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 1 seconds
    Then I should see "3" in the ".proposal__info--votes .value" element
    And I fill in the following:
      | proposal-vote__username   | test                |
      | proposal-vote__email      | test@coucou.fr      |
    And I check "proposal-vote__private"
    And I press "Soutenir"
    And I wait 1 seconds
    Then I should see "4" in the ".proposal__info--votes .value" element
    And I should see "Anonyme" in the ".proposal__vote:nth-child(1)" element
    And I should see "Merci, votre vote a bien été pris en compte"

  @javascript @security
  Scenario: Anonymous user wants to vote twice with the same email
    When I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes       |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 1 seconds
    Then I should see "3" in the ".proposal__info--votes .value" element
    And I fill in the following:
      | proposal-vote__username   | test                |
      | proposal-vote__email      | cheater@test.com    |
    And I press "Soutenir"
    And I wait 1 seconds
    Then I should see "Vous avez déjà voté pour cette proposition."

  @javascript @security
  Scenario: Anonymous user wants to vote with an email already associated to an account
    When I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes       |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 1 seconds
    Then I should see "3" in the ".proposal__info--votes .value" element
    And I fill in the following:
      | proposal-vote__username   | test                |
      | proposal-vote__email      | user@test.com    |
    And I press "Soutenir"
    And I wait 1 seconds
    Then I should see "Cette adresse électronique est déjà associée à un compte. Veuillez vous connecter pour soutenir cette proposition."

  @javascript @security
  Scenario: Logged in user wants to vote when he has not enough credits left
    Given I am logged in as admin
    When I visited "proposal page" with:
      | projectSlug      | projet-avec-budget                  |
      | stepSlug         | collecte-des-propositions-1         |
      | proposalSlug     | proposition-pas-chere               |
    And I wait 1 seconds
    Then the button "Soutenir" should be disabled
    And I should see "Pas assez de crédits. Désélectionnez un projet ou sélectionnez un projet moins coûteux."

  @javascript @security
  Scenario: Anonymous user wants to vote on a selection step that has budget vote
    When I visited "proposal page" with:
      | projectSlug      | projet-avec-budget                  |
      | stepSlug         | collecte-des-propositions-1         |
      | proposalSlug     | proposition-pas-chere               |
    And I wait 1 seconds
    And I press "Soutenir"
    And I wait 1 seconds
    Then I should see "Vous devez être connecté pour réaliser cette action."

  # Votes page
  @javascript
  Scenario: Logged in user wants to see his votes on a project and remove one
    Given I am logged in as user
    When I go to the votes details page
    Then there should be 2 votes
    And I should see "2 propositions sélectionnées"
    And I remove the first vote
    Then I should see "Merci, votre vote a bien été supprimé"
    And I should see "1 proposition sélectionnée"
    And there should be 1 votes

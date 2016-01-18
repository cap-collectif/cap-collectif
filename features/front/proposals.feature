@proposal
Feature: Proposals

  # Collect step : See proposals with filters, sorting and search term

  @javascript @elasticsearch
  Scenario: Anonymous user wants to see proposals in a collect step and apply filters
    Given I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions        |
    And I wait 1 seconds
    And I should see "4 propositions"
    Then I should see 4 ".proposal__preview" elements
    And I select "Justice" from "proposal-filter-theme"
    And I wait 1 seconds
    And I should see "3 propositions"
    Then I should see 3 ".proposal__preview" elements

  @javascript @elasticsearch
  Scenario: Anonymous user wants to see proposals in a collect step and sort them
    Given I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions        |
    And I wait 1 seconds
    Then "Rénovation du gymnase" should be before "Ravalement de la façade de la bibliothèque municipale" for selector ".proposal__preview .proposal__title a"
    And I press "Commentées"
    And I wait 1 seconds
    Then "Ravalement de la façade de la bibliothèque municipale" should be before "Rénovation du gymnase" for selector ".proposal__preview .proposal__title a"

  @javascript @elasticsearch
  Scenario: Anonymous user wants to see proposals in a collect step and search by term
    Given I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions        |
    And I wait 1 seconds
    And I should see "4 propositions"
    Then I should see 4 ".proposal__preview" elements
    And I fill in the following:
      | proposal-search-input | gymnase banc |
    And I press "proposal-search-button"
    And I wait 1 seconds
    And I should see "2 propositions"
    Then I should see 2 ".proposal__preview" elements
    And I should see "Rénovation du gymnase"
    And I should see "Installation de bancs sur la place de la mairie"

  @javascript @elasticsearch
  Scenario: Anonymous user combine search, filters and sorting on proposals in a collect step
    Given I am logged in as user
    And I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions        |
    And I wait 1 seconds
    Then I should see 4 ".proposal__preview" elements
    And I press "Commentées"
    And I fill in the following:
      | proposal-search-input | bibliothèque banc |
    And I press "proposal-search-button"
    And I select "Justice" from "proposal-filter-theme"
    And I wait 1 seconds
    Then I should see 2 ".proposal__preview" elements
    And I should see "Ravalement de la façade de la bibliothèque municipale"
    And I should see "Installation de bancs sur la place de la mairie"
    Then "Ravalement de la façade de la bibliothèque municipale" should be before "Installation de bancs sur la place de la mairie" for selector ".proposal__preview .proposal__title a"

  # CRUD

  @database @javascript @elasticsearch
  Scenario: Logged in user wants to create a proposal
    Given I am logged in as user
    And I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions        |
    And I wait 1 seconds
    Then I should see "4 propositions"
    When I press "Faire une proposition"
    And I wait 1 seconds
    And I fill in the following:
      | proposal_title    | Nouvelle proposition créée      |
      | proposal_body     | Description de ma proposition   |
      | proposal_custom-1 | Réponse à la question 1         |
      | proposal_custom-2 | Réponse à la question 2         |
    And I select "Beaulieu" from "proposal_district"
    And I press "Publier"
    And I wait 1 seconds
    Then I should see "Merci ! Votre proposition a bien été créée."
    And I wait 1 seconds
    And I should see "5 propositions"
    And I should see "Nouvelle proposition créée"

  @database @javascript @elasticsearch
  Scenario: Logged in user wants to create a proposal with theme
    Given feature "themes" is enabled
    And I am logged in as user
    And I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions        |
    And I wait 1 seconds
    Then I should see "4 propositions"
    When I press "Faire une proposition"
    And I wait 1 seconds
    And I fill in the following:
      | proposal_title    | Nouvelle proposition créée      |
      | proposal_body     | Description de ma proposition   |
      | proposal_custom-1 | Réponse à la question 1         |
      | proposal_custom-2 | Réponse à la question 2         |
    And I select "Justice" from "proposal_theme"
    And I select "Beaulieu" from "proposal_district"
    And I press "Publier"
    And I wait 1 seconds
    Then I should see "Merci ! Votre proposition a bien été créée."
    And I wait 1 seconds
    And I should see "5 propositions"
    And I should see "Nouvelle proposition créée"

  @javascript @security
  Scenario: Logged in user wants to create a proposal without providing required response
    Given I am logged in as user
    And I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions        |
    And I wait 1 seconds
    When I press "Faire une proposition"
    And I wait 1 seconds
    And I fill in the following:
      | proposal_title    | Nouvelle proposition créée      |
      | proposal_body     | Description de ma proposition   |
      | proposal_custom-1 | Réponse à la question 1         |
    And I select "Beaulieu" from "proposal_district"
    And I press "Publier"
    And I wait 1 seconds
    Then I should see "Ce champ est obligatoire."

  @javascript @security
  Scenario: Logged in user wants to create a proposal in closed collect step
    Given I am logged in as user
    And I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions-fermee |
    And I wait 1 seconds
    Then I should see "Dépôt terminé. Merci à tous d'avoir contribué."
    And the button "Faire une proposition" should be disabled

  @javascript @security
  Scenario: Anonymous user wants to create a proposal
    Given I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions |
    And I wait 1 seconds
    When I press "Faire une proposition"
    And I wait 1 seconds
    Then I should see "Vous devez être connecté pour réaliser cette action."

  @javascript @database
  Scenario: Author of a proposal wants to update it
    Given I am logged in as user
    And I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes       |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 1 seconds
    Then I press "Modifier"
    And I wait 1 seconds
    And I fill in the following:
      | proposal_title    | Nouveau titre                           |
    And I press "Publier"
    And I wait 1 seconds
    Then I should see "Votre proposition a bien été modifiée."
    And I should not see "Rénovation du gymnase"
    And I should see "Nouveau titre"

  @javascript
  Scenario: Non author of a proposal wants to update it
    Given I am logged in as admin
    And I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes       |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 1 seconds
    Then I should not see "Modifier" in the ".proposal__content .proposal__buttons" element

  @javascript @database @elasticsearch
  Scenario: Author of a proposal wants to delete it
    Given I am logged in as user
    And I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions        |
    And I wait 1 seconds
    Then I should see "4 propositions"
    And I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes       |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 1 seconds
    Then I press "Supprimer"
    And I wait 1 seconds
    And I press "confirm-proposal-delete"
    And I wait 3 seconds
    Then I should see "3 propositions"
    And I should not see "Rénovation du gymnase"

  @javascript
  Scenario: Non author of a proposal wants to delete it
    Given I am logged in as admin
    And I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes       |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 1 seconds
    Then I should not see "Supprimer" in the ".proposal__content .proposal__buttons" element


  # Reporting

  @javascript @database @circle
  Scenario: Logged in user wants to report a proposal
    Given feature "reporting" is enabled
    And I am logged in as user
    And I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes                       |
      | stepSlug         | collecte-des-propositions                        |
      | proposalSlug     | installation-de-bancs-sur-la-place-de-la-mairie  |
    And I wait 1 seconds
    When I follow "Signaler"
    And I wait 1 seconds
    And I fill in the following:
      | capco_app_reporting_status | 1                       |
      | capco_app_reporting_body   | Pas terrible tout ça... |
    And I press "Signaler"
    And I wait 1 seconds
    Then I should see "Merci ! Votre signalement a bien été pris en compte."


  # Selection step : See proposals with filters, sorting and search term

  @javascript @elasticsearch
  Scenario: Anonymous user wants to see proposals in a selection step and apply filters
    Given I visited "selection page" with:
      | projectSlug | budget-participatif-rennes   |
      | stepSlug    | selection                    |
    And I wait 1 seconds
    And I should see "3 propositions"
    Then I should see 3 ".proposal__preview" elements
    And I select "Justice" from "proposal-filter-theme"
    And I wait 1 seconds
    And I should see "2 propositions"
    Then I should see 2 ".proposal__preview" elements

  @javascript @elasticsearch
  Scenario: Anonymous user wants to see proposals in a selection step and sort them
    Given I visited "selection page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | selection                        |
    And I wait 1 seconds
    Then "Rénovation du gymnase" should be before "Ravalement de la façade de la bibliothèque municipale" for selector ".proposal__preview .proposal__title a"
    And I press "Commentées"
    And I wait 1 seconds
    Then "Ravalement de la façade de la bibliothèque municipale" should be before "Rénovation du gymnase" for selector ".proposal__preview .proposal__title a"

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
  Scenario: Logged in user wants to vote when he has not enough credits left
    Given I am logged in as admin
    When I visited "selection page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | selection                        |
    And I wait 1 seconds
    Then "#proposal-1 .proposal__preview__vote" element should have class "disabled"
  # Hovering does not work properly. To fix later
  #  And I hover over the "#proposal-1 .proposal__preview__vote" element
  #  And I wait 1 seconds
  #  Then I should see "Pas assez de crédits. Désélectionnez un projet ou sélectionnez un projet moins coûteux."

  @javascript @security @elasticsearch
  Scenario: Anonymous API client wants to vote with an email that has not enough credits left
    When I visited "selection page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | selection                        |
    And I wait 1 seconds
    When I click the "#proposal-1 .proposal__preview__vote" element
    And I wait 1 seconds
    And I fill in the following:
      | proposal-vote__username   | test                |
      | proposal-vote__email      | voter@test.com      |
    And I press "confirm-proposal-vote"
    And I wait 1 seconds
    Then I should see "Vous n'avez pas suffisamment de crédits disponibles pour soutenir cette proposition."

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
      | projectSlug      | budget-participatif-rennes                             |
      | stepSlug         | collecte-des-propositions                              |
      | proposalSlug     | ravalement-de-la-facade-de-la-bibliotheque-municipale  |
    And I wait 1 seconds
    Then the button "Soutenir" should be disabled
    And I should see "Pas assez de crédits. Désélectionnez un projet ou sélectionnez un projet moins coûteux."

  @javascript @security
  Scenario: Anonymous API client wants to vote with an email that has not enough credits left
    When I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes                             |
      | stepSlug         | collecte-des-propositions                              |
      | proposalSlug     | ravalement-de-la-facade-de-la-bibliotheque-municipale  |
    And I wait 1 seconds
    And I fill in the following:
      | proposal-vote__username   | test                |
      | proposal-vote__email      | voter@test.com      |
    And I press "Soutenir"
    And I wait 1 seconds
    Then I should see "Vous n'avez pas suffisamment de crédits disponibles pour soutenir cette proposition."
Feature: Proposals

  # See proposals with filters, sorting and search term

  @javascript
  Scenario: Anonymous user wants to see proposals in a collect step and apply filters
    Given I am logged in as user
    And I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions        |
    And I wait 5 seconds
    And I should see "4 propositions"
    Then I should see 4 ".proposal__preview" elements
    And I select "Justice" from "proposal-filter-theme"
    And I wait 5 seconds
    And I should see "3 propositions"
    Then I should see 3 ".proposal__preview" elements

  @javascript
  Scenario: Anonymous user wants to see proposals in a collect step and sort them
    Given I am logged in as user
    And I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions        |
    And I wait 5 seconds
    Then "Rénovation du gymnase" should be before "Ravalement de la façade de la bibliothèque municipale" for selector ".proposal__preview .proposal__title a"
    And I press "Commentées"
    And I wait 5 seconds
    Then "Ravalement de la façade de la bibliothèque municipale" should be before "Rénovation du gymnase" for selector ".proposal__preview .proposal__title a"

  @javascript
  Scenario: Anonymous user wants to see proposals in a collect step and search by term
    Given I am logged in as user
    And I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions        |
    And I wait 5 seconds
    And I should see "4 propositions"
    Then I should see 4 ".proposal__preview" elements
    And I fill in the following:
      | proposal-search-input | gymnase banc |
    And I press "proposal-search-button"
    And I wait 5 seconds
    And I should see "2 propositions"
    Then I should see 2 ".proposal__preview" elements
    And I should see "Rénovation du gymnase"
    And I should see "Installation de bancs sur la place de la mairie"

#  @javascript
#  Scenario: Anonymous user combine search, filters and sorting on proposals
#    Given I am logged in as user
#    And I visited "collect page" with:
#      | projectSlug | budget-participatif-rennes       |
#      | stepSlug    | collecte-des-propositions        |
#    And I wait 5 seconds
#    Then I should see 4 ".proposal__preview" elements
#    And I fill in the following:
#      | proposal-search-input | bibliothèque banc |
#    And I press "proposal-search-button"
#    And I press "Commentées"
#    And I select "Justice" from "proposal-filter-theme"
#    And I wait 5 seconds
#    Then I should see 2 ".proposal__preview" elements
#    And I should see "Ravalement de la façade de la bibliothèque municipale"
#    And I should see "Installation de bancs sur la place de la mairie"
#    Then "Ravalement de la façade de la bibliothèque municipale" should be before "Installation de bancs sur la place de la mairie" for selector ".proposal__preview .proposal__title a"

  # CRUD

  @database @javascript
  Scenario: Logged in user wants to create a proposal
    Given I am logged in as user
    And I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions        |
    And I wait 5 seconds
    When I press "Faire une proposition"
    And I wait 5 seconds
    And I fill in the following:
      | proposal_title    | Nouvelle proposition créée      |
      | proposal_body     | Description de ma proposition   |
      | proposal_custom-1 | Réponse à la question 1         |
      | proposal_custom-2 | Réponse à la question 2         |
    And I select "Justice" from "proposal_theme"
    And I select "Beaulieu" from "proposal_district"
    And I press "Publier"
    And I wait 5 seconds
    Then I should see "Merci ! Votre proposition a bien été créée."
    And I should see "5 propositions"
    And I should see "Nouvelle proposition créée"

  @javascript
  Scenario: Logged in user wants to create a proposal in closed collect step
    Given I am logged in as user
    And I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions-fermee |
    And I wait 5 seconds
    Then I should see "Dépôt terminé. Merci à tous d'avoir contribué."
    And the button "Faire une proposition" should be disabled

  @javascript
  Scenario: Anonymous user wants to create a proposal
    Given I visited "collect page" with:
      | projectSlug | budget-participatif-rennes       |
      | stepSlug    | collecte-des-propositions |
    And I wait 5 seconds
    When I press "Faire une proposition"
    And I wait 5 seconds
    Then I should see "Vous devez être connecté pour réaliser cette action."

  @javascript @database
  Scenario: Author of a proposal wants to update it
    Given I am logged in as user
    And I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes       |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 5 seconds
    Then I press "Modifier"
    And I wait 5 seconds
    And I fill in the following:
      | proposal_title    | Nouveau titre                           |
    And I select "Immobilier" from "proposal_theme"
    And I press "Publier"
    And I wait 5 seconds
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
    And I wait 5 seconds
    Then I should not see "Modifier" in the ".proposal__content .proposal__buttons" element

  @javascript @database
  Scenario: Author of a proposal wants to delete it
    Given I am logged in as user
    And I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes       |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 5 seconds
    Then I press "Supprimer"
    And I wait 5 seconds
    And I press "confirm"
    And I wait 5 seconds
    Then I should see "3 propositions"
    And I should not see "Rénovation du gymnase"

  @javascript
  Scenario: Non author of a proposal wants to delete it
    Given I am logged in as admin
    And I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes       |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 5 seconds
    Then I should not see "Supprimer" in the ".proposal__content .proposal__buttons" element


  # Reporting

  @javascript @database
  Scenario: Logged in user wants to report a proposal
    Given feature "reporting" is enabled
    And I am logged in as user
    And I visited "proposal page" with:
      | projectSlug      | budget-participatif-rennes                       |
      | stepSlug         | collecte-des-propositions                        |
      | proposalSlug     | installation-de-bancs-sur-la-place-de-la-mairie  |
    And I wait 5 seconds
    When I follow "Signaler"
    And I wait 5 seconds
    And I fill in the following:
      | capco_app_reporting_status | 1                       |
      | capco_app_reporting_body   | Pas terrible tout ça... |
    And I press "Signaler"
    And I wait 5 seconds
    Then I should see "Merci ! Votre signalement a bien été pris en compte."

  # Votes

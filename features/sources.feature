Feature: Source

  Scenario: Can create a source in contribuable opinion
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | causes                           |
      | opinionSlug      | opinion-2                        |
    When I follow "Ajouter une source"
    And I fill in the following:
    | capco_app_source_link   | http://www.google.fr     |
    | capco_app_source_title  | Titre de la source       |
    | capco_app_source_body   | Contenu de la source     |
    And I select "Politique" from "capco_app_source_Category"
    And I press "Publier"
    Then I should see "Merci ! Votre source a bien été enregistrée."

  Scenario: Can not create an argument in non-contribuable opinion
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug   | strategie-technologique-de-l-etat-et-services-publics |
      | stepSlug           | collecte-des-avis-pour-une-meilleur-strategie         |
      | opinionTypeSlug    | causes                                                |
      | opinionSlug        | opinion-7                                             |
    Then I should not see "Proposer une source"

 @javascript @database
  Scenario: Can vote for a source
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | enjeux                           |
      | opinionSlug      | opinion-3                        |
    And I collapse sources list
    When I vote for the first source
    Then I should see "Merci ! Votre vote a bien été pris en compte."
    When I collapse sources list
    Then I should see "Annuler mon vote"
    When I vote for the first source
    Then I should see "Votre vote a bien été annulé."

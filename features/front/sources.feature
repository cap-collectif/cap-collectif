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

  Scenario: Can not create a source in non-contribuable consultation
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug   | strategie-technologique-de-l-etat-et-services-publics |
      | stepSlug           | collecte-des-avis-pour-une-meilleur-strategie         |
      | opinionTypeSlug    | causes                                                |
      | opinionSlug        | opinion-51                                            |
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

 # Update
Scenario: Author of a source loose their votes when updating it
  Given I am logged in as user
  And I visited "opinion page" with:
    | consultationSlug | croissance-innovation-disruption |
    | stepSlug         | collecte-des-avis                |
    | opinionTypeSlug  | problemes                        |
    | opinionSlug      | opinion-1                        |
  And I should see "1" in the ".opinion--source .nb-votes" element
  When I follow "Modifier"
  And I fill in the following:
    | capco_app_source_body      | Je modifie ma source !   |
  And I check "capco_app_source_confirm"
  And I press "Modifier"
  Then I should see "Merci ! Votre source a bien été modifiée."
  And I should see "0" in the ".opinion--source .nb-votes" element

Scenario: Non author of a source wants to update it
  Given I am logged in as admin
  And I visited "opinion page" with:
    | consultationSlug | croissance-innovation-disruption |
    | stepSlug         | collecte-des-avis                |
    | opinionTypeSlug  | problemes                        |
    | opinionSlug      | opinion-1                        |
  Then I should not see "Modifier" in the ".pull-right" element

Scenario: Author of a source try to update without checking the confirm checkbox
  Given I am logged in as user
  And I visited "opinion page" with:
    | consultationSlug | croissance-innovation-disruption |
    | stepSlug         | collecte-des-avis                |
    | opinionTypeSlug  | problemes                        |
    | opinionSlug      | opinion-1                        |
  When I follow "Modifier"
  And I fill in the following:
    | capco_app_source_body      | Je modifie ma source !   |
  And I press "Modifier"
  Then I should see "Merci de confirmer la perte de vos votes pour continuer."

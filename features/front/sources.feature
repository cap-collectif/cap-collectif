@source
Feature: Source

  @javascript @database
  Scenario: Can create a source in contribuable opinion
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | causes                           |
      | opinionSlug      | opinion-2                        |
    When I follow "1 source"
    And I wait "1" seconds
    When I click the "#render-opinion-sources .btn-primary" element
    And I wait "1" seconds
    And I fill in the following:
    | sourceLink   | http://www.google.fr     |
    | sourceTitle  | Titre de la source       |
    | sourceBody   | Contenu de la source     |
    And I select "Politique" from "sourceCategory"
    And I click the ".modal-footer .btn-primary" element
    And I wait "5" seconds
    Then I should see "2 sources"

  @javascript
  Scenario: Can not create a source in non-contribuable consultation
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug   | strategie-technologique-de-l-etat-et-services-publics |
      | stepSlug           | collecte-des-avis-pour-une-meilleur-strategie         |
      | opinionTypeSlug    | causes                                                |
      | opinionSlug        | opinion-51                                            |
    When I follow "Aucune source"
    And I wait "1" seconds
    Then I should not see "Proposer une source"

 @javascript @database
  Scenario: Can vote for a source
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | enjeux                           |
      | opinionSlug      | opinion-4                        |
    When I follow "1 source"
    And I wait "1" seconds
    When I vote for the first source
    Then I should see "Annuler mon vote"
    When I vote for the first source
    Then I should see "D'accord"

 # Update
  @javascript @database
  Scenario: Author of a source loose their votes when updating it
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | problemes                        |
      | opinionSlug      | opinion-1                        |
    When I follow "2 sources"
    And I wait "1" seconds
    And The first source vote counter should be "1"
    When I follow "Modifier"
    And I fill in the following:
      | capco_app_source_body    | Je modifie ma source !   |
    And I check "capco_app_source_confirm"
    And I press "Modifier"
    Then I should see "Merci ! Votre source a bien été modifiée."
    And I wait "5" seconds
    And The first source vote counter should be "0"

  @javascript
  Scenario: Non author of a source wants to update it
    Given I am logged in as admin
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | problemes                        |
      | opinionSlug      | opinion-1                        |
    Then I should not see "Modifier" in the ".pull-right" element

  @javascript @database
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


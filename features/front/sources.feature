Feature: Source

  @javascript @database
  Scenario: User wants to add a source in a contribuable opinion
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | causes                           |
      | opinionSlug      | opinion-2                        |
    And I wait 3 seconds
    And I go on the sources tab
    And I should see "Aucune source proposée"
    And I wait 3 seconds
    When I want to add a source
    And I fill in the following:
    | sourceLink   | http://www.google.fr     |
    | sourceTitle  | Titre de la source       |
    | sourceBody   | Contenu de la source     |
    And I select "Politique" from "sourceCategory"
    And I click the ".modal-footer .btn-primary" element
    And I wait "5" seconds
    Then I should see "1 source"

  @javascript
  Scenario: Can not create a source in non-contribuable consultation
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug   | strategie-technologique-de-l-etat-et-services-publics |
      | stepSlug           | collecte-des-avis-pour-une-meilleur-strategie         |
      | opinionTypeSlug    | causes                                                |
      | opinionSlug        | opinion-51                                            |
    And I go on the sources tab
    Then I should not see "Proposer une source"

 @javascript @database
  Scenario: Can vote for a source
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | enjeux                           |
      | opinionSlug      | opinion-4                        |
    And I wait 3 seconds
    And I go on the sources tab
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
    And I wait 3 seconds
    And I go on the sources tab
    And The first source vote counter should be "1"
    When I click the "#render-opinion-sources .btn-dark-gray" element
    And I wait 3 seconds
    And I check "capco_app_source_confirm"
    And I press "Modifier"
    And I wait 3 seconds
    Then I should see "Merci ! Votre source a bien été modifiée."
    And I wait 5 seconds
    And I go on the sources tab
    And The first source vote counter should be "0"

  @javascript @database
  Scenario: Author of a source try to update without checking the confirm checkbox
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | problemes                        |
      | opinionSlug      | opinion-1                        |
    And I wait 3 seconds
    And I go on the sources tab
    When I click the "#render-opinion-sources .btn-dark-gray" element
    And I wait 3 seconds
    And I fill in the following:
      | capco_app_source_body      | Je modifie ma source !   |
    And I press "Modifier"
    And I wait 3 seconds
    Then I should not see "Merci ! Votre source a bien été modifiée."

  @javascript
  Scenario: Non author of a source wants to update it
    Given I am logged in as admin
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | problemes                        |
      | opinionSlug      | opinion-1                        |
    And I go on the sources tab
    Then I should not see "Modifier" in the "#render-opinion-sources" element


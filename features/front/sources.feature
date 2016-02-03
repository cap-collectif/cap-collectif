@source
Feature: Source

  @javascript @database
  Scenario: User wants to add a source in a contribuable opinion
    Given I am logged in as user
    And I visited "opinion page" with:
      | projectSlug      | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | les-causes-1                     |
      | opinionSlug      | opinion-12                       |
    And I go on the sources tab
    And I should see "Aucune source proposée"
    When I want to add a source
    And I wait 1 seconds
    And I fill in the following:
    | sourceLink   | http://www.google.fr     |
    | sourceTitle  | Titre de la source       |
    | sourceBody   | Contenu de la source     |
    And I select "Politique" from "sourceCategory"
    And I click the ".modal-footer .btn-primary" element
    And I wait 2 seconds
    Then I should see "1 source"

  @javascript
  Scenario: Can not create a source in non-contribuable project
    Given I am logged in as user
    And I visited "opinion page" with:
      | projectSlug        | strategie-technologique-de-l-etat-et-services-publics |
      | stepSlug           | collecte-des-avis-pour-une-meilleur-strategie         |
      | opinionTypeSlug    | les-causes-2                                          |
      | opinionSlug        | opinion-51                                            |
    And I should see "Consultation terminée"
    And I go on the sources tab
    Then I should not see "Proposer une source"

 @javascript @database
  Scenario: Can vote for a source
    Given I am logged in as admin
    And I visited "opinion page" with:
      | projectSlug      | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | les-causes-1                     |
      | opinionSlug      | opinion-2                        |
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
      | projectSlug      | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | les-causes-1                     |
      | opinionSlug      | opinion-2                        |
    And I wait 1 seconds
    And I go on the sources tab
    And The first source vote counter should be "1"
    When I click the "#source-35 .source__btn--edit" element
    And I wait 1 seconds
    And I check "sourceEditCheck"
    And I press "confirm-opinion-source-update"
    And I wait 3 seconds
    Then I should see "Merci ! Votre source a bien été modifiée."
    And I wait 1 seconds
    And I go on the sources tab
    And The first source vote counter should be "0"

  @javascript @database
  Scenario: Author of a source try to update without checking the confirm checkbox
    Given I am logged in as user
    And I visited "opinion page" with:
      | projectSlug      | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | les-causes-1                     |
      | opinionSlug      | opinion-2                        |
    And I wait 1 seconds
    And I go on the sources tab
    When I click the "#source-35 .source__btn--edit" element
    And I wait 1 seconds
    And I fill in the following:
      | sourceBody       | Je modifie ma source !   |
    And I press "confirm-opinion-source-update"
    Then I should see "Veuillez cocher cette case pour continuer."

  @javascript
  Scenario: Non author of a source can not update or delete
    Given I am logged in as admin
    And I visited "opinion page" with:
      | projectSlug      | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | les-causes-1                     |
      | opinionSlug      | opinion-2                        |
    And I wait 1 seconds
    And I go on the sources tab
    Then I should not see "Modifier" in the "#source-35" element
    Then I should not see "Supprimer" in the "#source-35" element

 # Delete
  @javascript @database
  Scenario: Author of a source wants to delete it
    Given I am logged in as user
    And I visited "opinion page" with:
      | projectSlug      | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | causes                           |
      | opinionSlug      | opinion-2                        |
    And I wait 1 seconds
    And I go on the sources tab
    And I should see a "#source-35" element
    When I click the "#source-35 .source__btn--delete" element
    And I press "confirm-opinion-source-delete"
    And I wait 1 seconds
    And I should not see a "#source-35" element

  # Reporting
  @javascript @security
  Scenario: Author of a source can not report it
    Given feature "reporting" is enabled
    And I am logged in as user
    And I visited "opinion page" with:
      | projectSlug      | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | causes                           |
      | opinionSlug      | opinion-2                        |
    And I wait 1 seconds
    And I go on the sources tab
    And I should see a "#source-35" element
    And I should not see a "#source-35 .source__btn--report" element

  @javascript
  Scenario: Non author of a source can report it
    Given feature "reporting" is enabled
    And I am logged in as admin
    And I visited "opinion page" with:
      | projectSlug      | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | causes                           |
      | opinionSlug      | opinion-2                        |
    And I wait 1 seconds
    And I go on the sources tab
    And I should see a "#source-35" element
    When I click the "#source-35 .source__btn--report" element
    And I select "Contenu à caractère sexuel" from "reportType"
    And I fill in the following:
      | reportBody   | scandaleux     |
    And I press "confirm-opinion-source-report"
    And I wait 3 seconds
    Then I should see "Merci ! La source a bien été signalée."

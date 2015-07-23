Feature: Arguments

  @database
  Scenario: Can create an argument in contribuable opinion
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | causes                           |
      | opinionSlug      | opinion-2                        |
    When I submit a "yes" argument with text "Texte de mon argument"
    Then I should see "Merci ! Votre argument a bien été enregistré."

  Scenario: Can not create an argument in non-contribuable consultation
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | strategie-technologique-de-l-etat-et-services-publics |
      | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
      | opinionTypeSlug  | causes                                                |
      | opinionSlug      | opinion-51                                           |
    Then I should not see "Argument yes field" on "opinionPage"
    And I should not see "Argument no field" on "opinionPage"

  @javascript @database
  Scenario: Logged in user wants to vote for an argument
    And I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | causes                           |
      | opinionSlug      | opinion-2                        |
    When I click the "#arg-45 .btn" element
    Then I should see "1" in the "#arg-45 .opinion__votes-nb" element
    And I wait 5 seconds
    And I should see "Merci ! Votre vote a bien été pris en compte."
    And I should see "Annuler mon vote"
    And I click the "#arg-45 .btn" element
    And I should see "Votre vote a bien été annulé."
    And I should see "0" in the "#arg-45 .opinion__votes-nb" element

  @database
  Scenario: Author of an argument loose their votes when updating it
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | causes                           |
      | opinionSlug      | opinion-2                        |
    And I should see "5" in the "#arg-1 .opinion__votes-nb" element
    When I follow "Modifier"
    And I fill in the following:
      | capco_app_argument_body      | Je modifie mon argument !   |
    And I check "capco_app_argument_confirm"
    And I press "Modifier"
    Then I should see "Merci ! Votre argument a bien été modifié."
    And I should see "0" in the "#arg-1 .opinion__votes-nb" element

  Scenario: Non author of an argument wants to update it
    Given I am logged in as admin
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | causes                           |
      | opinionSlug      | opinion-2                        |
    Then I should not see "Modifier" in the "#arg-1" element

  Scenario: Author of an argument try to update without checking the confirm checkbox
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | causes                           |
      | opinionSlug      | opinion-2                        |
    When I follow "Modifier"
    And I fill in the following:
      | capco_app_argument_body      | Je modifie mon argument !   |
    And I press "Modifier"
    Then I should see "Merci de confirmer la perte de vos votes pour continuer."

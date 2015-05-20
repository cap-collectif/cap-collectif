Feature: Arguments

  Scenario: Can create an argument in contribuable opinion
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | causes                           |
      | opinionSlug      | opinion-2                        |
    When I submit a "yes" argument with text "Texte de mon argument"
    Then I should see "Merci ! Votre argument a bien été enregistré."

  Scenario: Can not create an argument in non-contribuable opinion
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | strategie-technologique-de-l-etat-et-services-publics |
      | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
      | opinionTypeSlug  | causes                                                |
      | opinionSlug      | opinion-7                                             |
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
    When I click the ".opinion__arguments--no .opinion__body .btn" element
    Then I should see "1" in the ".opinion__arguments--no .opinion__body .opinion__votes-nb" element
    And I wait "2" seconds
    And I should see "Merci ! Votre vote a bien été pris en compte."
    And I should see "Annuler mon vote"
    And I click the ".opinion__arguments--no .opinion__body .btn" element
    And I should see "Votre vote a bien été annulé."
    And I should see "0" in the ".opinion__arguments--no .opinion__body .opinion__votes-nb" element

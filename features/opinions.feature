Feature: Opinions

  Scenario: Can create an opinion of contribuable type in opened consultation
    Given I am logged in as user
    And I visited "consultation page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
    When I follow "Causes"
    And I follow "Proposer"
    And I fill in the following:
      | capco_app_opinion_title     | Titre                           |
      | capco_app_opinion_body      | Description de ma proposition   |
    And I press "Publier"
    Then I should see "Merci ! Votre proposition a bien été enregistrée."

  Scenario: Can not create an opinion of non-contribuable type
    Given I am logged in as user
    And I visited "consultation page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
    When I follow "Problèmes"
    Then I should not see "Proposer"

  Scenario: Can not create an opinion in closed consultation
    Given I am logged in as user
    And I visited "consultation page" with:
      | consultationSlug   | strategie-technologique-de-l-etat-et-services-publics |
      | stepSlug           | collecte-des-avis-pour-une-meilleur-strategie         |
    When I follow "Causes"
    Then I should see "Consultation terminée. La période de participation est maintenant terminée. Merci à tous d'avoir contribué."
    And I should not see "Proposer"

  Scenario: Can not create an opinion when not logged in
    Given I visited "consultation page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
    When I follow "Causes"
    And I follow "Proposer"
    Then I should see "Connection form" on "login page"

  Scenario: Logged in user can report an opinion
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | solutions                        |
      | opinionSlug      | opinion-5                        |
    When I follow "Signaler"
    And I fill in the following:
      | capco_app_reporting_status | 1                       |
      | capco_app_reporting_body   | Pas terrible tout ça... |
    And I press "Signaler"
    Then I should see "Merci ! Votre signalement a bien été pris en compte."

  @javascript @database
  Scenario: Logged in user wants to vote
    Given I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | solutions                        |
      | opinionSlug      | opinion-5                        |
    When I click the ".connection-popover-js > label" element
    Then I should see "1" in the ".opinion__chart" element

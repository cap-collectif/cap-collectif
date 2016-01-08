Feature: Opinions

  @database
  Scenario: Can create an opinion of contribuable type in opened project
    Given I am logged in as user
    And I visited "consultation page" with:
      | projectSlug | croissance-innovation-disruption |
      | stepSlug    | collecte-des-avis                |
    When I follow "btn-add--les-causes-1"
    And I fill in the following:
      | opinion_title | Titre                           |
      | opinion_body  | Description de ma proposition   |
    And I press "Publier"
    Then I should see "Merci ! Votre proposition a bien été enregistrée."

  @security
  Scenario: Can not create an opinion of non-contribuable type
    Given I am logged in as user
    And I visited "consultation page" with:
      | projectSlug | croissance-innovation-disruption |
      | stepSlug    | collecte-des-avis                |
    Then I should not see "Proposer" in the "#opinions--le-probleme-constate-1" element

  @security
  Scenario: Can not create an opinion in closed project
    Given I am logged in as user
    And I visited "consultation page" with:
      | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
      | stepSlug    | collecte-des-avis-pour-une-meilleur-strategie         |
    Then I should see "Consultation terminée. Merci à tous d'avoir contribué."
    And I should not see "Proposer"

  @security
  Scenario: Can not create an opinion when not logged in
    Given I visited "consultation page" with:
      | projectSlug | croissance-innovation-disruption |
      | stepSlug    | collecte-des-avis                |
    When I follow "btn-add--les-causes-1"
    Then I should see "Connection form" on "login page"

  @javascript @database
  Scenario: Logged in user can report an opinion
    Given feature "reporting" is enabled
    And I am logged in as user
    And I visited "opinion page" with:
      | projectSlug      | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | solutions                        |
      | opinionSlug      | opinion-5                        |
    And I wait 4 seconds
    When I follow "Signaler"
    And I wait 1 seconds
    And I fill in the following:
      | capco_app_reporting_status | 1                       |
      | capco_app_reporting_body   | Pas terrible tout ça... |
    And I press "Signaler"
    And I wait 1 seconds
    Then I should see "Merci ! Votre signalement a bien été pris en compte."

  @javascript @database
  Scenario: Author of an opinion loose their votes when updating it
    Given I am logged in as user
    And I visited "opinion page" with:
      | projectSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | enjeux                           |
      | opinionSlug      | opinion-3                        |
    And I wait 1 seconds
    And I should see "1 vote" in the ".opinion__votes" element
    When I follow "Modifier"
    And I wait 1 seconds
    And I fill in the following:
      | opinion_body | Je modifie ma proposition !   |
    And I check "opinion_confirm"
    And I press "Modifier"
    And I wait 1 seconds
    Then I should see "Merci ! Votre proposition a bien été modifiée."
    And I should see "0 vote" in the ".opinion__votes" element

  @javascript @security
  Scenario: Non author of an opinion wants to update it
    Given I am logged in as admin
    And I visited "opinion page" with:
      | projectSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | enjeux                           |
      | opinionSlug      | opinion-3                        |
    And I wait 1 seconds
    Then I should not see "Modifier" in the ".opinion__description .opinion__buttons" element

  @javascript
  Scenario: Anonymous wants to see opinion appendix
    Given I visited "opinion page" with:
      | projectSlug | projet-de-loi-renseignement      |
      | stepSlug         | elaboration-de-la-loi            |
      | opinionTypeSlug  | articles                         |
      | opinionSlug      | article-1                        |
    And I wait 1 seconds
    Then I should see "Motifs 1"
    And I press "Exposé des motifs"
    And I wait 1 seconds
    Then I should not see "Motifs 1"
    And I press "Étude d'impact"
    And I wait 1 seconds
    Then I should see "Impacts 1"

  @javascript
  Scenario: Logged in user wants to create a linked opinion
    Given I am logged in as user
    And I visited "opinion page" with:
      | projectSlug      | projet-de-loi-renseignement               |
      | stepSlug         | elaboration-de-la-loi                     |
      | opinionTypeSlug  | section-1-ouverture-des-donnees-publiques |
      | opinionSlug      | article-1                                 |
    And I wait 2 seconds
    Then I should see "0 proposition liée"
    When I go on the connections tab
    And I press "Ajouter une proposition liée"
    And I wait 2 seconds
    And I select "Section 1" from "opinion_type"
    And I fill in the following:
      | opinion_title      | Titre                           |
      | opinion_body       | Description de ma proposition   |
      | opinion_appendix-1 | Exposay                         |
    And I click the "#confirm" element
    And I wait 1 seconds
    Then I should see "1 proposition liée"
    And I should see "Titre" in the "#links-list" element



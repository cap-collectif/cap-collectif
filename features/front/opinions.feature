Feature: Opinions

  @database
  Scenario: Can create an opinion of contribuable type in opened consultation
    Given I am logged in as user
    And I visited "consultation page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
    When I follow "btn-add--les-causes-1"
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
    Then I should not see "Proposer" in the "#opinions--le-probleme-constate-1" element

  Scenario: Can not create an opinion in closed consultation
    Given I am logged in as user
    And I visited "consultation page" with:
      | consultationSlug   | strategie-technologique-de-l-etat-et-services-publics |
      | stepSlug           | collecte-des-avis-pour-une-meilleur-strategie         |
    Then I should see "Consultation terminée. La période de participation est maintenant terminée. Merci à tous d'avoir contribué."
    And I should not see "Proposer"

  Scenario: Can not create an opinion when not logged in
    Given I visited "consultation page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
    When I follow "btn-add--les-causes-1"
    Then I should see "Connection form" on "login page"

  @javascript @database
  Scenario: Logged in user can report an opinion
    Given feature "reporting" is enabled
    And I am logged in as user
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | solutions                        |
      | opinionSlug      | opinion-5                        |
    And I wait 5 seconds
    When I click the "#render-opinion .opinion__action--report" element
    And I wait 5 seconds
    And I fill in the following:
      | capco_app_reporting_status | 1                       |
      | capco_app_reporting_body   | Pas terrible tout ça... |
    And I press "Signaler"
    And I wait 5 seconds
    Then I should see "Merci ! Votre signalement a bien été pris en compte."

#  @javascript @database
#  Scenario: Author of an opinion loose their votes when updating it
#    Given I am logged in as user
#    And I visited "opinion page" with:
#      | consultationSlug | croissance-innovation-disruption |
#      | stepSlug         | collecte-des-avis                |
#      | opinionTypeSlug  | enjeux                           |
#      | opinionSlug      | opinion-3                        |
#    And I wait 5 seconds
#    And I should see "50 votes" in the ".opinion__votes" element
#    When I follow "Modifier"
#    And I wait 5 seconds
#    And I fill in the following:
#      | capco_app_opinion_body | Je modifie ma proposition !   |
#    And I check "capco_app_opinion_confirm"
#    And I follow "Modifier"
#    And I wait 5 seconds
#    Then I should see "Merci ! Votre proposition a bien été modifiée."
#    And I should see "0 vote" in the ".opinion__votes" element

  @javascript
  Scenario: Non author of an opinion wants to update it
    Given I am logged in as admin
    And I visited "opinion page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
      | opinionTypeSlug  | enjeux                           |
      | opinionSlug      | opinion-3                        |
    And I wait 5 seconds
    Then I should not see "Modifier" in the "#render-opinion" element

#  @javascript
#  Scenario: Author of an opinion try to update without checking the confirm checkbox
#    Given I am logged in as user
#    And I visited "opinion page" with:
#      | consultationSlug | croissance-innovation-disruption |
#      | stepSlug         | collecte-des-avis                |
#      | opinionTypeSlug  | enjeux                           |
#      | opinionSlug      | opinion-3                        |
#    And I wait 5 seconds
#    When I follow "Modifier"
#    And I wait 5 seconds
#    And I fill in the following:
#      | capco_app_opinion_body | Je modifie ma proposition !   |
#    And I follow "Modifier"
#    And I wait 5 seconds
#    Then I should see "Merci de confirmer la perte de vos votes pour continuer."

  @javascript
  Scenario: Anonymous wants to see opinion appendix
    Given I visited "opinion page" with:
      | consultationSlug | projet-de-loi-renseignement      |
      | stepSlug         | elaboration-de-la-loi            |
      | opinionTypeSlug  | articles                         |
      | opinionSlug      | article-1                        |
    And I wait 3 seconds
    Then I should see "Motifs 1"
    And I press "Exposé des motifs"
    And I wait 3 seconds
    Then I should not see "Motifs 1"
    And I press "Étude d'impact"
    And I wait 3 seconds
    Then I should see "Impacts 1"


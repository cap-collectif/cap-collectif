Feature: Opinions

  Scenario: Can create an opinion of contribuable type in opened consultation
    Given I am logged in as user
    And I visited consultationPage with:
      | slug | croissance-innovation-disruption |
    When I follow "Causes"
    And I follow "Proposer"
    And I fill in the following:
      | capco_app_opinion_title     | Titre                           |
      | capco_app_opinion_body      | Description de ma proposition   |
    And I press "Publier"
    Then I should see "Merci ! Votre proposition a bien été enregistrée."

  Scenario: Can not create an opinion of non-contribuable type
    Given I am logged in as user
    And I visited consultationPage with:
      | slug | croissance-innovation-disruption |
    When I follow "Problèmes"
    Then I should not see "Proposer"

  Scenario: Can not create an opinion in closed consultation
    Given I am logged in as user
    And I visited consultationPage with:
      | slug | strategie-technologique-de-l-etat-et-services-publics |
    When I follow "Causes"
    Then I should see "Consultation terminée. La période de participation est maintenant terminée. Merci à tous d'avoir contribué."
    And I should not see "Proposer"

  Scenario: Can not create an opinion when not logged in
    Given I am logged in as user
    And I visited consultationPage with:
      | slug | croissance-innovation-disruption |
    When I follow "Causes"
    And I follow "Proposer"
    Then I should see "Connection form" from "loginPage"

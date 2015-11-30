Feature: Proposals

  @database
  Scenario: Logged in user wants to create a proposal
    Given I am logged in as user
    And I visited "collect page" with:
      | projectSlug | croissance-innovation-disruption |
      | stepSlug    | collecte-des-propositions        |
    When I follow "add-proposal"
    And I fill in the following:
      | proposal_title    | Titre                           |
      | proposal_body     | Description de ma proposition   |
      | proposal_custom-1 | Réponse à la question 1         |
      | proposal_custom-2 | Réponse à la question 2         |
    And I press "Publier"
    Then I should see "Merci ! Votre proposition a bien été enregistrée."

  Scenario: Logged in user wants to create a proposal in closed collect step
    Given I am logged in as user
    And I visited "collect page" with:
      | projectSlug | croissance-innovation-disruption |
      | stepSlug    | collecte-des-propositions-fermee |
    Then I should see "Étape de collecte terminée. La période de participation est maintenant terminée. Merci à tous d'avoir contribué."
    And I should not see "Faire une proposition"

  Scenario: Anonymous user wants to create a proposal
    And I visited "collect page" with:
      | projectSlug | croissance-innovation-disruption |
      | stepSlug    | collecte-des-propositions-fermee |
    When I follow "add-proposal"
    Then I should see "Connection form" on "login page"

  @javascript @database
  Scenario: Logged in user wants to report a proposal
    Given feature "reporting" is enabled
    And I am logged in as user
    And I visited "proposal page" with:
      | projectSlug      | croissance-innovation-disruption |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 5 seconds
    When I follow "Signaler"
    And I wait 5 seconds
    And I fill in the following:
      | capco_app_reporting_status | 1                       |
      | capco_app_reporting_body   | Pas terrible tout ça... |
    And I press "Signaler"
    And I wait 5 seconds
    Then I should see "Merci ! Votre signalement a bien été pris en compte."

  @javascript
  Scenario: Non author of a proposal wants to update it
    Given I am logged in as admin
    And I visited "proposal page" with:
      | projectSlug      | croissance-innovation-disruption |
      | stepSlug         | collecte-des-propositions        |
      | proposalSlug     | renovation-du-gymnase            |
    And I wait 5 seconds
    Then I should not see "Modifier" in the ".proposal__description .proposal__buttons" element

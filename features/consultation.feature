Feature: Consultation
  
  Scenario: Consultation should contain allowed types only
    Given I am logged in as user
    And I visited "consultation page" with:
      | slug | strategie-technologique-de-l-etat-et-services-publics |
    Then I should see 4 "Opinion nav item" on current page

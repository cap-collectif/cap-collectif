Feature: Consultation
  
  Scenario: Consultation should contain allowed types only
    Given I am logged in as user
    And I visited "consultation page" with:
      | consultationSlug   | strategie-technologique-de-l-etat-et-services-publics |
      | stepSlug           | collecte-des-avis-pour-une-meilleur-strategie         |
    Then I should see 4 "Opinion nav item" on current page

  Scenario: Presentation step should display correct number of element
    Given feature "calendar" is enabled
    And feature "blog" is enabled
    And I visited "consultation page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
    And I follow "Présentation"
    Then I should see 2 ".media--news" elements
    And I should see 2 ".event" elements

  Scenario: Events menu for consultation should display correct number of events
    Given feature "calendar" is enabled
    And I visited "consultation page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
    And I follow "Évènements"
    And I should see 2 ".event" elements

  Scenario: Posts menu for consultation should display correct number of posts
    Given feature "blog" is enabled
    And I visited "consultation page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
    And I follow "Actualités"
    And I should see 5 ".media--news" elements

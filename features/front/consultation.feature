Feature: Consultation

  Scenario: Can not sort or filter if feature consultations_form is disabled
    Given I visited "consultations page"
    Then I should not see "capco_app_search_consultation"

  @javascript
  Scenario: Consultation can be sorted by published date
    Given feature "consultations_form" is enabled
    And I visited "consultations page"
    And I select "Date de publication" from "capco_app_search_consultation_sort"
    And I wait 5 seconds
    Then "Consultation vide" should be before "Croissance, innovation, disruption" for selector ".thumbnail--custom .figcaption h2 a "

  @javascript
  Scenario: Consultation can be sorted by contributions number
    Given feature "consultations_form" is enabled
    And I visited "consultations page"
    And I select "Nombre de contributions" from "capco_app_search_consultation_sort"
    And I wait 5 seconds
    Then "Croissance, innovation, disruption" should be before "Consultation vide" for selector ".thumbnail--custom .figcaption h2 a "

  @javascript
  Scenario: Consultation can be filtered by theme
    Given feature "themes" is enabled
    And feature "consultations_form" is enabled
    And I visited "consultations page"
    And I select "Transport" from "capco_app_search_consultation_theme"
    And I wait 5 seconds
    Then I should see 2 ".thumbnail--custom" elements
    And I should see "Stratégie technologique de l'Etat et services publics"
    And I should see "Consultation vide"
    And I should not see "Croissance, innovation, disruption"

  @javascript
  Scenario: Consultation can be filtered by theme and sorted by contributions number at the same time
    Given feature "themes" is enabled
    And feature "consultations_form" is enabled
    And I visited "consultations page"
    And I select "Transport" from "capco_app_search_consultation_theme"
    And I wait 5 seconds
    And I select "Nombre de contributions" from "capco_app_search_consultation_sort"
    And I wait 5 seconds
    Then I should see 2 ".thumbnail--custom" elements
    And I should see "Stratégie technologique de l'Etat et services publics"
    And I should see "Consultation vide"
    And I should not see "Croissance, innovation, disruption"
    And "Croissance, innovation, disruption" should be before "Consultation vide" for selector ".thumbnail--custom .figcaption h2 a "

  @javascript
  Scenario: Consultation can be filtered by title
    Given feature "consultations_form" is enabled
    And I visited "consultations page"
    When I fill in the following:
      | capco_app_search_consultation_term | innovation |
    And I click the ".filter__search .btn" element
    And I wait 5 seconds
    Then I should see 1 ".thumbnail--custom" elements
    And I should see "Croissance, innovation, disruption"
    And I should not see "Stratégie technologique de l'Etat et services publics"
    And I should not see "Consultation vide"

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
    And I should see 10 ".media--news" elements

  Scenario: Consultation header should display correct number of votes
    Given I visited "consultation page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
    Then I should see "206 votes"

  @javascript
  Scenario: Consultation header should display correct number of contributions
    Given I visited "consultation page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
    Then I should see "205 contributions"
    And I hover over the "#contributions-counter-pill" element
    And I should see "25 propositions"
    And I should see "150 arguments"
    And I should see "30 sources"

  Scenario: Consultation header should display correct number of participants
    Given I visited "consultation page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
    Then I should see "22 participants"

  Scenario: Can download a consultation in xslx format
    Given I visited "home page"
    When I try to download "consultations/croissance-innovation-disruption/consultation/collecte-des-avis/download/xlsx"
    Then I should see in the header "Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

  Scenario: Can download a consultation in csv format
    Given I visited "home page"
    When I try to download "consultations/croissance-innovation-disruption/consultation/collecte-des-avis/download/csv"
    Then I should see in the header "Content-Type: text/csv; charset=UTF-8"

  Scenario: Can download a consultation in xls format
    Given I visited "home page"
    When I try to download "consultations/croissance-innovation-disruption/consultation/collecte-des-avis/download/xls"
    Then I should see in the header "Content-Type: application/vnd.ms-excel"

  Scenario: Can not have access to download if export is disabled
    Given I visited "consultation page" with:
      | consultationSlug   | strategie-technologique-de-l-etat-et-services-publics |
      | stepSlug           | collecte-des-avis-pour-une-meilleur-strategie         |
    Then I should not see "Exporter"

  Scenario: Can not download a consultation if export is disabled
    Given I visited "home page"
    When I try to download "consultations/strategie-technologique-de-l-etat-et-services-publics/consultation/collecte-des-avis-pour-une-meilleur-strategie/download/xls"
    Then I should see response status code "404"

  Scenario: Can not access trash if feature is disabled
    Given I am logged in as user
    And I visited "consultation page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
    Then I should not see "Corbeille"

  Scenario: Can not access trash if not logged in
    Given feature "consultation_trash" is enabled
    And I visited "consultation page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
    When I follow "Corbeille"
    Then I should see "Se connecter"

  Scenario: Consultation trash display correct numbers of elements
    Given feature "consultation_trash" is enabled
    And I am logged in as user
    And I visited "consultation page" with:
      | consultationSlug | croissance-innovation-disruption |
      | stepSlug         | collecte-des-avis                |
    When I follow "Corbeille"
    Then I should see 56 ".opinion__list .opinion" elements
    And I should see "56" in the "span.badge" element

  Scenario: I should not see opinion types menu when only one type is allowed
    Given I visited "consultation page" with:
      | consultationSlug | consultation-vide |
      | stepSlug         | consultation      |
    Then I should see 0 ".consultation__nav" on current page

Feature: Synthesis

# View

@javascript
Scenario: User wants to see synthesis view
  Given I visited "consultation page" with:
    | consultationSlug   | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug           | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I wait 10 seconds
  Then I should see 1 ".synthesis__view" elements


# Edition

  # Access

@javascript
Scenario: User can not access synthesis edition
  Given I am logged in as user
  And I visited "consultation page" with:
    | consultationSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  Then I should not see "Éditer"

@javascript
Scenario: Anonymous can not access synthesis edition
  Given I visited "consultation page" with:
    | consultationSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  Then I should not see "Éditer"

  # Lists

@javascript
Scenario: Admin wants to see new elements list
  Given I am logged in as admin
  And I visited "consultation page" with:
    | consultationSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  Then I should see 6 ".element" elements

@javascript
Scenario: Admin wants to see archived elements list
  Given I am logged in as admin
  And I visited "consultation page" with:
    | consultationSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Traitées"
  And I wait 5 seconds
  Then I should see 11 ".element" elements

@javascript
Scenario: Admin wants to see unpublished elements list
  Given I am logged in as admin
  And I visited "consultation page" with:
    | consultationSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Dépubliées"
  And I wait 5 seconds
  Then I should see 0 ".element" elements

@javascript
Scenario: Admin wants to see all elements list
  Given I am logged in as admin
  And I visited "consultation page" with:
    | consultationSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Toutes"
  And I wait 5 seconds
  Then I should see 17 ".element" elements

@javascript
Scenario: Admin wants to see elements tree
  Given I am logged in as admin
  And I visited "consultation page" with:
    | consultationSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Arborescence"
  And I wait 5 seconds
  Then I should see 2 ".tree-level-0 > .elements-tree__item" elements

  # Element details

@javascript
Scenario: Admin wants to see an element details
  Given I am logged in as admin
  And I visited "consultation page" with:
    | consultationSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Opinion 51"
  And I wait 5 seconds
  Then I should see "Contenu de ma super opinion !"

  # Actions

@javascript @database
Scenario: Admin wants to note an element
  Given I am logged in as admin
  And I visited "consultation page" with:
    | consultationSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Opinion 51"
  And I wait 5 seconds
  And I click the "#notation-button-2" element
  Then "#notation-star-1" element should have class "active"
  And "#notation-star-2" element should have class "active"
  And "#notation-star-3" element should not have class "active"
  And "#notation-star-4" element should not have class "active"
  And "#notation-star-5" element should not have class "active"

@javascript @database
Scenario: Admin wants to disable an element
  Given I am logged in as admin
  And I visited "consultation page" with:
    | consultationSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Opinion 51"
  And I wait 5 seconds
  And I click the ".element__action-disable button" element
  And I follow "Dépubliées"
  And I wait 5 seconds
  And I should see 1 ".element" element
  And I follow "Traitées"
  And I wait 5 seconds
  And I should see 1 ".element" element

@javascript @database
Scenario: Admin wants to archive an element
  Given I am logged in as admin
  And I visited "consultation page" with:
    | consultationSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Opinion 51"
  And I wait 5 seconds
  And I click the ".element__action-archive button" element
  And I follow "Traitées"
  And I wait 5 seconds
  And I should see 1 ".element" elements
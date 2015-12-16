Feature: Synthesis

# View

@javascript
Scenario: Anonymous wants to see synthesis view
  Given I visited "consultation page" with:
    | projectSlug        | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug           | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I wait 5 seconds
  Then I should see 1 ".synthesis__view" elements

# Edition

  # Access

@javascript
Scenario: User can not access synthesis edition
  Given I am logged in as user
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I wait 5 seconds
  Then I should not see "Éditer"

@javascript
Scenario: Anonymous can not access synthesis edition
  Given I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I wait 5 seconds
  Then I should not see "Éditer"

  # Lists

@javascript
Scenario: Admin wants to see new elements list
  Given I am logged in as admin
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  Then I should see 6 ".element" elements

@javascript
Scenario: Admin wants to see archived elements list
  Given I am logged in as admin
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Traitées"
  And I wait 5 seconds
  Then I should see 11 ".element" elements

@javascript
Scenario: Admin wants to see published elements list
  Given I am logged in as admin
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Classées"
  And I wait 5 seconds
  Then I should see 11 ".element" elements

@javascript
Scenario: Admin wants to see unpublished elements list
  Given I am logged in as admin
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Ignorées"
  And I wait 5 seconds
  Then I should see 0 ".element" elements

@javascript
Scenario: Admin wants to see all elements list
  Given I am logged in as admin
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Toutes"
  And I wait 5 seconds
  Then I should see 15 ".element" elements

#@javascript
#Scenario: Admin wants to see elements tree
#  Given I am logged in as admin
#  And I visited "consultation page" with:
#    | projectSlug      | strategie-technologique-de-l-etat-et-services-publics |
#    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
#  And I follow "Synthèse"
#  And I follow "Éditer"
#  And I wait 5 seconds
#  And I follow "Les contributions"
#  And I wait 5 seconds
#  Then I should see 2 ".synthesis__content .tree--level-0 > .tree__item" elements

  # Element details

@javascript
Scenario: Admin wants to see an element details
  Given I am logged in as admin
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Opinion 51"
  And I wait 5 seconds
  Then I should see "Contenu de ma super opinion !"

  # Actions

@javascript @database
Scenario: Admin wants to ignore an element
  Given I am logged in as admin
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Traitées"
  And I wait 5 seconds
  And I follow "Les causes"
  And I wait 5 seconds
  And I click the ".element__action-ignore" element
  And I wait 5 seconds
  And I click the ".modal--confirm__submit" element
  And I wait 5 seconds
  And I should see "L'élément a été traité avec succès."
  And I follow "Ignorées"
  And I wait 5 seconds
  And I should see 11 ".element" element
  And I follow "Traitées"
  And I wait 5 seconds
  Then I should see 15 ".element" element

@javascript @database
Scenario: Admin wants to publish an element without note, comment or parent
  Given I am logged in as admin
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 8 seconds
  And I follow "Opinion 52"
  And I wait 8 seconds
  And I click the ".element__action-publish" element
  And I wait 8 seconds
  And I click the "button[type='submit']" element
  And I wait 8 seconds
  And I should see "L'élément a été traité avec succès."
  And I follow "Traitées"
  And I wait 5 seconds
  And I should see 12 ".element" element

@javascript @database
Scenario: Admin wants to publish an element with note
  Given I am logged in as admin
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Opinion 52"
  And I wait 5 seconds
  And I click the ".element__action-publish" element
  And I wait 5 seconds
  And I click the "#notation-button-4" element
  And I wait 5 seconds
  And I click the "button[type='submit']" element
  And I wait 5 seconds
  And I should see "L'élément a été traité avec succès."
  And I follow "Traitées"
  And I wait 5 seconds
  And I should see 12 ".element" element
  And I follow "Opinion 52"
  And I wait 5 seconds
  And "#notation-star-1" element should have class "active"
  And "#notation-star-2" element should have class "active"
  And "#notation-star-3" element should have class "active"
  And "#notation-star-4" element should have class "active"
  And "#notation-star-5" element should not have class "active"

@javascript @database
Scenario: Admin wants to publish an element with parent
  Given I am logged in as admin
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Opinion 52"
  And I wait 5 seconds
  And I click the ".element__action-publish" element
  And I wait 15 seconds
  And I click the ".modal--publish #element-root" element
  And I wait 5 seconds
  And I click the "button[type='submit']" element
  And I wait 5 seconds
  And I should see "L'élément a été traité avec succès."
  And I follow "Traitées"
  And I wait 5 seconds
  And I should see 12 ".element" element

@javascript @database
Scenario: Admin wants to publish an element with comment
  Given I am logged in as admin
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Opinion 52"
  And I wait 5 seconds
  And I click the ".element__action-publish" element
  And I wait 5 seconds
  And I fill in the following:
    | publish_element_comment | Cette contribution est inutile ! |
  And I wait 5 seconds
  And I click the "button[type='submit']" element
  And I wait 5 seconds
  And I should see "L'élément a été traité avec succès."
  And I follow "Traitées"
  And I wait 5 seconds
  And I should see 12 ".element" element

@javascript
Scenario: Admin wants to divide an element without selecting text
  Given I am logged in as admin
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Opinion 52"
  And I wait 5 seconds
  And I click the ".element__action-divide" element
  And I wait 5 seconds
  And I click the ".division__create-element" element
  And I wait 5 seconds
  Then I should see "Veuillez sélectionner du texte dans le contenu pour créer une nouvelle contribution."

@javascript
Scenario: Admin wants to create an element
  Given I am logged in as admin
  And I visited "consultation page" with:
    | projectSlug | strategie-technologique-de-l-etat-et-services-publics |
    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
  And I follow "Synthèse"
  And I follow "Éditer"
  And I wait 5 seconds
  And I follow "Nouveau dossier"
  And I wait 5 seconds
  And I fill in the following:
    | new_element_title | Bisous |
  And I wait 5 seconds
  And I click the ".modal--create #element-root" element
  And I wait 5 seconds
  And I click the "button[type='submit']" element
  And I wait 5 seconds
  Then I follow "Traitées"
  And I wait 5 seconds
  And I should see "Bisous" in the ".synthesis__content" element


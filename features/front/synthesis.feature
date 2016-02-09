@synthesis
Feature: Synthesis

# View

@javascript
Scenario: Anonymous wants to see synthesis view
  Given I go to a synthesis page
  Then I should see the synthesis

# Edition

  # Access

@javascript
Scenario: User can not access synthesis edition
  Given I am logged in as user
  And I go to a synthesis page
  Then I should not see "Éditer"

@javascript
Scenario: Anonymous can not access synthesis edition
  Given I go to a synthesis page
  Then I should not see "Éditer"

  # Lists

@javascript
Scenario: Admin wants to see new elements list
  Given I am logged in as admin
  And I go to a synthesis edition page
  Then I should see the new synthesis elements

@javascript
Scenario: Admin wants to see archived elements list
  Given I am logged in as admin
  And I go to a synthesis edition page
  When I go to the archived inbox
  Then I should see the archived synthesis elements

@javascript
Scenario: Admin wants to see published elements list
  Given I am logged in as admin
  And I go to a synthesis edition page
  When I go to the published inbox
  Then I should see the published synthesis elements

@javascript
Scenario: Admin wants to see unpublished elements list
  Given I am logged in as admin
  And I go to a synthesis edition page
  When I go to the unpublished inbox
  Then I should see the unpublished synthesis elements

@javascript
Scenario: Admin wants to see all elements list
  Given I am logged in as admin
  And I go to a synthesis edition page
  When I go to the all elements inbox
  Then I should see all the synthesis elements

#@javascript
#Scenario: Admin wants to see elements tree
#  Given I am logged in as admin
#  And I visited "consultation page" with:
#    | projectSlug      | strategie-technologique-de-l-etat-et-services-publics |
#    | stepSlug         | collecte-des-avis-pour-une-meilleur-strategie         |
#  And I follow "Synthèse"
#  And I follow "Éditer"
#  And I wait 1 seconds
#  And I follow "Les contributions"
#  And I wait 1 seconds
#  Then I should see 2 ".synthesis__content .tree--level-0 > .tree__item" elements

  # Element details

@javascript
Scenario: Admin wants to see an element details
  Given I am logged in as admin
  And I go to a synthesis edition page
  When I click on a synthesis element
  Then I should see the synthesis element details

  # Actions

@javascript @database
Scenario: Admin wants to ignore an element
  Given I am logged in as admin
  And I go to a synthesis edition page
  When I click on a synthesis element
  And I click the ignore element button
  And I confirm the ignore element action
  Then I should see "L'élément a été traité avec succès."
  And I should see the synthesis element in the unpublished inbox

@javascript @database
Scenario: Admin wants to publish an element without note, comment or parent
  Given I am logged in as admin
  And I go to a synthesis edition page
  When I click on a synthesis element
  And I click the publish element button
  And I confirm element publication
  Then I should see "L'élément a été traité avec succès."
  And I should see the synthesis element in the archived inbox

@javascript @database
Scenario: Admin wants to publish an element with note
  Given I am logged in as admin
  And I go to a synthesis edition page
  When I click on a synthesis element
  And I click the publish element button
  And I give a note to the synthesis element
  And I confirm element publication
  Then I should see "L'élément a été traité avec succès."
  And I should see the synthesis element in the archived inbox
  When I click on a synthesis element
  Then the synthesis element should have the correct note

@javascript @database
Scenario: Admin wants to publish an element with parent
  Given I am logged in as admin
  And I go to a synthesis edition page
  When I click on a synthesis element
  And I click the publish element button
  And I choose a parent for the synthesis element
  And I confirm element publication
  Then I should see "L'élément a été traité avec succès."
  And I should see the synthesis element in the archived inbox

@javascript @database
Scenario: Admin wants to publish an element with comment
  Given I am logged in as admin
  And I go to a synthesis edition page
  When I click on a synthesis element
  And I click the publish element button
  And I add a comment to the synthesis element
  And I confirm element publication
  Then I should see "L'élément a été traité avec succès."
  And I should see the synthesis element in the archived inbox

@javascript
Scenario: Admin wants to divide an element without selecting text
  Given I am logged in as admin
  And I go to a synthesis edition page
  When I click on a synthesis element
  And I click the divide element button
  And I click the create element division button
  Then I should see "Veuillez sélectionner du texte dans le contenu pour créer une nouvelle contribution."

@javascript
Scenario: Admin wants to create an element
  Given I am logged in as admin
  And I go to a synthesis edition page
  When I click the new folder button
  And I create a new synthesis element
  Then I should see my newly created element in the archived inbox

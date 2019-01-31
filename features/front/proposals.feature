@bp @proposals
Feature: Proposals

# Collect step : See proposals with filters, sorting and search term
@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and apply filters
  Given features themes, districts are enabled
  And I go to an open collect step
  Then there should be 6 proposals
  And I change the proposals theme filter
  Then there should be 5 proposals

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and apply status filters
  Given features themes, districts are enabled
  And I go to an open collect step
  Then there should be 6 proposals
  And I change the proposals status filter to "Approuvé"
  Then there should be 1 proposals
  And I change the proposals status filter to "En cours"
  Then there should be 4 proposals

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and apply contributor type filters
  Given features themes, districts, user_type are enabled
  And I go to an open collect step
  Then there should be 6 proposals
  And I change the proposals contributor type filter to "Citoyen"
  Then there should be 6 proposals
  And I change the proposals contributor type filter to "Institution"
  Then there should be 0 proposals

@elasticsearch
Scenario: Anonymous user wants to see proposals in a private collect step
  Given I go to a private open collect step
  Then there should be 0 proposals

@elasticsearch
Scenario: Logged in user wants to see its proposals in a private collect step
  Given I am logged in as user
  And I go to a private open collect step
  Then there should be 2 proposals

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and sort them
  Given I go to an open collect step
  Then proposals should be ordered randomly
  When I sort proposals by date
  Then proposal "Proposition pas encore votable" should be before proposal "Ravalement de la façade de la bibliothèque municipale"
  When I sort proposals by comments
  Then proposals should be ordered by comments

@elasticsearch
Scenario: Anonymous user wants to see last proposals when he returns on the list of proposals
  Given I go to an open collect step
  Then proposals should be ordered randomly
  When I save current proposals
  Then I go to an open collect step
  When proposals should be ordered randomly
  Then I should see same proposals

@elasticsearch
Scenario: Anonymous user wants to search a proposal with the random filter
  Given I go to an open collect step
  Then proposals should be ordered randomly
  When I search for proposals with terms "plantation"
  Then I should not see random row

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and search by term
  Given I go to an open collect step
  Then there should be 6 proposals
  When I search for proposals with terms "proposition"
  Then there should be 2 proposals
  Then proposals should be filtered by terms

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and search by reference
  Given I go to an open collect step
  Then there should be 6 proposals
  When I search for proposals with terms "1-7"
  Then there should be 1 proposals
  Then proposals should be filtered by references

@elasticsearch
Scenario: Anonymous user wants to see proposals in a collect step and search by term but find no ones
  Given I go to an open collect step
  Then there should be 6 proposals
  When I search for proposals with terms "toto"
  Then there should be 0 proposals
  Then proposals should have no results

@elasticsearch
Scenario: Anonymous user combine search, filters and sorting on proposals in a collect step
  Given features themes, districts are enabled
  And I am logged in as user
  And I go to an open collect step
  Then there should be 6 proposals
  When I sort proposals by comments
  And I search for proposals with terms "proposition"
  And I change the proposals theme filter
  Then there should be 2 proposals
  Then proposals should be filtered by theme and terms and sorted by comments

Scenario: Anonymous user wants to see proposals likers
  Given I go to an open collect step
  Then I should see the proposal likers

# CRUD

@database
Scenario: Logged in user wants to create a proposal with theme
  Given features themes, districts are enabled
  And I am logged in as user
  And I go to an open collect step
  Then there should be 6 proposals
  When I click the create proposal button
  And I fill the proposal form with a theme
  And I attach the file "/var/www/features/files/document.pdf" to "proposal-form-responses[3]_field"
  And I wait 3 seconds
  And I submit the create proposal form
  And I should see my new proposal
  Then I should see text matching "proposal.tabs.followers"
  And I click the "#proposal-page-tabs-tab-followers" element
  And I should see my subscription as "user" in the proposal followers list

@security
Scenario: Logged in user wants to create a proposal without providing required response
  Given feature "districts" is enabled
  And I am logged in as user
  And I go to an open collect step
  When I click the create proposal button
  And I fill the proposal form without required response
  And I submit the create proposal form
  Then I should see "proposal.constraints.field_mandatory"
  When I reload the page, I should see a confirm popup

@security
Scenario: Logged in user wants to create a proposal in closed collect step
  Given I am logged in as user
  And I go to a closed collect step
  Then I should see "step.collect.alert.ended.title"
  Then I should see "step.collect.alert.ended.text"
  And the create proposal button should be disabled

@security
Scenario: Anonymous user wants to create a proposal
  Given I go to an open collect step
  When I click the create proposal button
  Then I should see a "#login-popover" element

@database
Scenario: Author of a proposal wants to update it
  Given feature districts is enabled
  When I am logged in as user
  And I go to a proposal
  When I click the edit proposal button
  And I wait 3 seconds
  And I change the proposal title
  And I attach the file "/var/www/features/files/document.pdf" to "proposal-form-responses[3]_field"
  And I wait 3 seconds
  And I submit the edit proposal form
  And I wait 1 seconds
  Then the proposal title should have changed

Scenario: Non author of a proposal wants to update it
  Given I am logged in as admin
  And I go to a proposal
  Then I should not see the edit proposal button

@database
Scenario: Author of a proposal wants to delete it
  Given I am logged in as user
  And I go to an open collect step
  Then there should be 6 proposals
  And I go to a proposal
  When I click the delete proposal button
  And I confirm proposal deletion
  And I wait 3 seconds
  And I should not see my proposal anymore
  And there should be 5 proposals

@database
Scenario: Admin should not be notified when an user deletes his proposal on an non notifiable proposal
  Given I am logged in as user
  And I go to a proposal which is not notifiable
  When I click the delete proposal button
  And I confirm proposal deletion
  Then I should not see mail with subject "notification.email.proposal.delete.subject"

@database @rabbitmq
Scenario: Author of a proposal should be notified when someone comment if he has turned on comments notifications
  Given I go to a proposal made by msantostefano@jolicode.com
  And I anonymously comment "Salut les filles" as "Marie Lopez" with address "enjoyphoenix@gmail.com"
  Then the queue associated to "comment_create" producer has messages below:
  | 0 | {"commentId": "@string@"} |

@database @rabbitmq
Scenario: Author of a proposal should not be notified when someone comment if he has turned off comments notifications
  Given I go to a proposal made by user@test.com
  And I anonymously comment "Salut les filles" as "Marie Lopez" with address "enjoyphoenix@gmail.com"
  Then the queue associated to "comment_create" producer has messages below:
  | 0 | {"commentId": "@string@"} |

Scenario: Non author of a proposal wants to delete it
  Given I am logged in as admin
  And I go to a proposal
  Then I should not see the delete proposal button

# Proposal page

@database
Scenario: Anonymous user should not see private fields on a proposal
  Given I go to a proposal
  Then I should not see the proposal private field

@database
Scenario: Non author should not see private fields on a proposal
  Given I am logged in as drupal
  When I go to a proposal
  Then I should not see the proposal private field

@database
Scenario: Logged in user should see private fields on his proposal
  Given I am logged in as user
  And I go to a proposal
  Then I should see the proposal private field

@database
Scenario: Admin should see private fields on a proposal
  Given I am logged in as admin
  And I go to a proposal
  Then I should see the proposal private field

# Reporting

@database
Scenario: Logged in user wants to report a proposal
  Given feature "reporting" is enabled
  And I am logged in as admin
  And I go to a proposal
  When I click the report proposal button
  And I fill the reporting form
  And I submit the reporting form
  Then I should see "alert.success.report.proposal" in the "#global-alert-box" element

# Sharing

@database
Scenario: Anonymous user wants to share a proposal
  Given feature "share_buttons" is enabled
  And I go to a proposal
  When I click the share proposal button
  Then I should see the share dropdown
  And I click the share link button
  Then I should see the share link modal

# Selection step : See proposals with filters, sorting and search term

@elasticsearch
Scenario: Anonymous user wants to see proposals in a selection step and apply filters
  Given feature "themes" is enabled
  When I go to a selection step with simple vote enabled
  Then there should be 3 proposals
  And I change the proposals theme filter
  Then there should be 2 proposals

@elasticsearch
Scenario: Anonymous user wants to see proposals in a selection step and sort them
  Given I go to a selection step with simple vote enabled
  Then proposals should be ordered randomly
  When I sort proposals by date
  Then proposal "Rénovation du gymnase" should be before proposal "Ravalement de la façade de la bibliothèque municipale"
  When I sort proposals by comments
  Then proposals should be ordered by comments

@elasticsearch
Scenario: Anonymous user wants to see saved proposals when he returns on the selection of proposals
  Given I go to a selection step
  Then proposals should be ordered randomly
  When I save current proposals
  Then I go to a selection step
  When proposals should be ordered randomly
  Then I should see same proposals

@elasticsearch
Scenario: Anonymous user want to show a proposal without actuality
  Given I go to a proposal not yet votable
  Then I should not see an "#proposal-page-tabs-tab-blog" element

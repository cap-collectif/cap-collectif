@bp @proposal_crud
Feature: Proposals Create Read Update Delete
#TODO do not have time to correctly fix this
@database
Scenario: Logged in user wants to create a proposal with theme
  Given features themes, districts are enabled
  And I am logged in as user
  And I go to an open collect step
  Then there should be 8 proposals
  When I click the create proposal button
  And I fill the proposal form with a theme
  And I attach the file "/var/www/features/files/document.pdf" to "proposal-form-responses3_field"
  And I wait 10 seconds
  And I submit the create proposal form
  And I go to "/project/budget-participatif-rennes/collect/collecte-des-propositions/proposals/nouvelle-proposition-creee"
  And I wait 10 seconds
  And I should see my new proposal
  Then I should see text matching "proposal.tabs.followers"
  And I wait 10 seconds
  And I click the "#proposal-page-tabs-tab-followers" element
  And I should see my subscription as "user" in the proposal followers list

@database
Scenario: Logged in user wants to create two proposal in under a minute
  Given feature "districts" is enabled
  And I am logged in as user
  When I go to a project with requirement condition to vote and ranking
  When I click the create proposal button
  When I fill the simple proposal form
  And I fill in the following:
    | proposal-form-responses0| 1337 |
  And I submit the create proposal form
  When I go to a project with requirement condition to vote and ranking
  When I click the create proposal button
  When I fill the simple proposal form
  And I submit the create proposal form
  When I go to a project with requirement condition to vote and ranking
  When I click the create proposal button
  When I fill the simple proposal form
  And I submit the create proposal form
  Then I should see "error.title.damn"

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
  Then I should see "step.selection.alert.ended.title"
  Then I should see "thank.for.contribution"
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
  And I wait 4 seconds
  And I change the proposal title
  And I attach the file "/var/www/features/files/document.pdf" to "proposal-form-responses3_field"
  And I wait 4 seconds
  And I submit the edit proposal form
  And I wait 2 seconds
  Then I should see "Nouveau titre" within 10 seconds
  And the proposal title should have changed

Scenario: Non author of a proposal wants to update it
  Given I am logged in as admin
  And I go to a proposal
  Then I should not see the edit proposal button

@database
Scenario: Author of a proposal wants to delete it
  Given I am logged in as user
  And I go to an open collect step
  Then there should be 8 proposals
  And I go to a proposal
  When I click the delete proposal button
  And I confirm proposal deletion
  And I wait 3 seconds
  And I should not see my proposal anymore
  And I wait 1 seconds
  And there should be 7 proposals

@database
Scenario: Admin should not be notified when an user deletes his proposal on an non notifiable proposal
  Given I am logged in as user
  And I go to a proposal which is not notifiable
  When I click the delete proposal button
  And I confirm proposal deletion
  Then I should not see mail with subject "notification.proposal.delete.subject"

@database @rabbitmq
Scenario: Author of a proposal should be notified when someone comment if he has turned on comments notifications
  Given I go to a proposal made by msantostefano@cap-collectif.com
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

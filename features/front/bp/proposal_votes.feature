@bp @proposalVotes
Feature: Proposal votes

## Votes from selection step page
#@database @elasticsearch @votes_from_selection_step @rabbitmq
#Scenario: Logged in user wants to vote for a proposal in a selection step
#  Given I am logged in as user
#  And I go to a selection step with simple vote enabled
#  And the proposal has 1 votes
#  When I click the proposal vote button
#  And I submit the proposal vote form
#  And I should see "vote.add_success" in the "#global-alert-box" element
#  Then the proposal should have 2 votes
#  And I wait "#global-alert-box .alert-success" to disappear on current page
#  Then I click the proposal unvote button
## it works locally but not on CI :-(
##  And I wait "vote.delete_success" to appear on current page in "#global-alert-box" maximum 50000
#  Then the proposal should have 1 votes

@security @elasticsearch @votes_from_selection_step
Scenario: Logged in user wants to vote when he has not enough credits left in a selection step
  Given I am logged in as admin
  When I go to a selection step with budget vote enabled
  Then the proposal "proposal8" vote button must be disabled
  # This only work on hover
  # When I click the proposal "proposal8" vote button
  # And I should see the proposal vote tooltip

@security @elasticsearch @votes_from_selection_step
Scenario: Anonymous user wants to vote on a selection step that has budget vote in a selection step
  Given I go to a selection step with budget vote enabled
  And I wait ".proposal-list-view-paginated" to appear on current page
  When I click the proposal vote button
  Then I should see a "#login-popover" element

@security @elasticsearch @votes_from_selection_step
Scenario: Logged in user wants to vote when he has reached limit in a selection step
  Given I am logged in as user
  And "user" has voted for proposal "proposal17" in selection step "selection-avec-vote-budget-limite"
  When I go to a selection step with budget vote limited enabled
  And the proposal "proposal18" vote button must be disabled
  # This only work on hover
  # When I click the proposal "proposal18" vote button
  # And I should see the proposal vote limited tooltip

@security @elasticsearch @votes_from_proposal
Scenario: Anonymous user wants to vote on a proposal page
  Given I go to a proposal
  When I click the proposal vote button
  Then I should see a "#login-popover" element

@security @votes_from_proposal
Scenario: Logged in user wants to vote when he has not enough credits left
  Given I am logged in as admin
  When I go to a proposal with budget vote enabled
  Then the proposal vote button must be disabled

@security @votes_from_proposal
Scenario: Anonymous user wants to vote for a proposal that is not votable yet
  Given I go to a proposal not yet votable
  Then the proposal vote button must not be present

@security @votes_from_proposal
Scenario: Anonymous user wants to vote for a proposal that is not votable anymore
  Given I go to a proposal not votable anymore
  Then the proposal vote button must not be present

# Votes page
@database
Scenario: Logged in user wants to see his votes on a project and remove one
  Given I am logged in as admin
  When I go to the votes details page
  Then I should see "Rénovation du gymnase" within 5 seconds in the "#ProposalsUserVotesPage" element
  And I should have 3 votes
  And I remove the first vote
  And I should have 2 votes

@database
Scenario: Logged in user wants to reorder my vote for a project
  Given I am logged in as user
  When I got to the votes details page of project with requirements
  And I wait 2 seconds
  Then I reorder my vote with "[id='vote-stepQ29sbGVjdFN0ZXA6Y29sbGVjdHN0ZXBWb3RlQ2xhc3NlbWVudA==-proposalUHJvcG9zYWw6cHJvcG9zYWwyNA==']" take place of proposal up
  And I wait 2 seconds
  Then I click the "#vote-table-step-collecte-avec-vote-classement-limite  #confirm-update-votes" element

@database
Scenario: Logged in user wants to set a vote as anonymous
  Given I am logged in as user
  When I got to the votes details page of project with requirements
  And I wait 1 seconds
  And I should not see "global.anonymous"
  Then I check element "UHJvcG9zYWw6cHJvcG9zYWwyNg==-proposal-vote__private-toggle"
  And I should see "global.anonymous" appear on current page in "body"
  Then I click on button "#confirm-update-votes"
  And I wait 1 seconds
  Then I reload the page
  And I should see "global.anonymous" appear on current page in "body"

@database
Scenario: Logged in user wants to delete a vote
  Given I am logged in as user
  When I got to the votes details page of project with requirements
  And I wait "#vote-table-step-selection-avec-vote-classement-limite" to appear on current page
  And the "#vote-table-step-selection-avec-vote-classement-limite" element should contain "Proposition 3"
  Then I delete a vote of a proposal "UHJvcG9zYWw6cHJvcG9zYWwyNg==-proposal-vote__private"
  And I wait 1 seconds
  And I should see "are-you-sure-you-want-to-delete-this-vote"
  Then I press "btn-delete"
  And I click on button "#confirm-update-votes"
  Then I reload the page
  And I wait 1 seconds
  And I wait "#vote-table-step-selection-avec-vote-classement-limite" to appear on current page
  And the "#vote-table-step-selection-avec-vote-classement-limite" element should not contain "Proposition 3"

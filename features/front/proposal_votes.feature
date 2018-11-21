@proposal_votes
Feature: Proposal votes

# Votes from selection step page
@javascript @database @elasticsearch @votes_from_selection_step
Scenario: Logged in user wants to vote and unvote for a proposal in a selection step
  Given I am logged in as user
  And I go to a selection step with simple vote enabled
  And the proposal has 1 votes
  When I click the proposal vote button
  And I submit the proposal vote form
  And I should see "proposal.request.vote.success" in the "#global-alert-box" element
  Then the proposal should have 2 votes
  And I reload the page
  Then the proposal should have 2 votes
  Then I click the proposal unvote button
  And I should see "proposal.request.delete_vote.success" in the "#global-alert-box" element
  Then the proposal should have 1 votes
  And I reload the page
  Then the proposal should have 1 votes

@javascript @security @elasticsearch @votes_from_selection_step
Scenario: Logged in user wants to vote when he has not enough credits left in a selection step
  Given I am logged in as admin
  When I go to a selection step with budget vote enabled
  Then the proposal vote button must be disabled
  # This only work on hover
  # When I click the proposal "proposal8" vote button
  # And I should see the proposal vote tooltip

@javascript @security @elasticsearch @votes_from_selection_step
Scenario: Anonymous user wants to vote on a selection step that has budget vote in a selection step
  Given I go to a selection step with budget vote enabled
  When I click the proposal vote button
  Then I should see a "#login-popover" element

@javascript @security @elasticsearch @votes_from_selection_step
Scenario: Logged in user wants to vote when he has reached limit in a selection step
  Given I am logged in as user
  And "user" has voted for proposal "proposal17" in selection step "selection-avec-vote-budget-limite"
  When I go to a selection step with budget vote limited enabled
  And the proposal "proposal18" vote button must be disabled
  # This only work on hover
  # When I click the proposal "proposal18" vote button
  # And I should see the proposal vote limited tooltip

# Votes from proposal page
@javascript @database @votes_from_proposal
Scenario: Logged in user wants to vote and unvote for a proposal
  Given I am logged in as user
  And I go to a proposal
  And the proposal has 1 votes
  And I click the proposal vote button
  And I submit the proposal vote form
  And I wait "#global-alert-box" to appear on current page
  And I should see "proposal.request.vote.success" in the "#global-alert-box" element
  And the proposal should have 2 votes
  And I go to the proposal votes tab
  And I should see my vote in the proposal votes list
  And I wait "#global-alert-box" to disappear on current page
  When I click the proposal unvote button
  And I wait "#global-alert-box" to appear on current page
  And I should see "proposal.request.delete_vote.success" in the "#global-alert-box" element
  And the proposal should have 1 votes
  And I should not see my vote in the proposal votes list

@javascript @database @votes_from_proposal
Scenario: Logged in user wants to vote for a proposal anonymously
  Given I am logged in as user
  And I go to a proposal
  And the proposal has 1 votes
  When I click the proposal vote button
  And I check the proposal vote private checkbox
  And I submit the proposal vote form
  And I wait "#global-alert-box" to appear on current page
  And I should see "proposal.request.vote.success" in the "#global-alert-box" element
  And the proposal should have 2 votes
  And I go to the proposal votes tab
  And I should see my anonymous vote in the proposal votes list

@javascript @security @votes_from_proposal
Scenario: Logged in user wants to vote when he has not enough credits left
  Given I am logged in as admin
  When I go to a proposal with budget vote enabled
  Then the proposal vote button must be disabled

@javascript @elasticsearch @database @votes_from_proposal
Scenario: Proposal should stay voted after user refresh the page
  Given I am logged in as user
  And I go to a collect step with vote
  And I vote for the first proposal
  And I submit the proposal vote form
  And I wait "#global-alert-box" to appear on current page
  And I should see "proposal.request.vote.success" in the "#global-alert-box" element
  # And I should see "proposal.vote.delete"
  Then I go to a collect step with vote
  And I should see "proposal.vote.voted"

@javascript @security @votes_from_proposal
Scenario: Anonymous user wants to vote for a proposal that is not votable yet
  Given I go to a proposal not yet votable
  Then the proposal vote button must not be present

@javascript @security @votes_from_proposal
Scenario: Anonymous user wants to vote for a proposal that is not votable anymore
  Given I go to a proposal not votable anymore
  Then the proposal vote button must not be present

# Votes page
@javascript @database
Scenario: Logged in user wants to see his votes on a project and remove one
  Given I am logged in as admin
  When I go to the votes details page
  Then I should have 3 votes
  And I should see 'project.votes.nb {"num":1}'
  And I remove the first vote
  And I should see 'project.votes.nb {"num":0}'
  And I should have 2 votes

@javascript @database
Scenario: Logged in as user who doesn't full fill requirements and want to vote...
  Given I am logged in as pierre
  When I go to a project with requirement condition to vote and ranking
  And I vote for the first proposal
  Then I should see a proposal vote modal
  Given I didn't full fill requirements conditions
  Then I cannot confirm my vote
  And I wait 1 seconds
  Then I full fill the requirements conditions
  And I confirm my vote
  # We delete the vote
  And I vote for the first proposal
  # We vote again
  And I vote for the first proposal
  And I should see "requirements filled"
  And the button "global.validate" should not be disabled
  Then I click on button "#confirm-proposal-vote"

@javascript @database
Scenario: Logged in user wants to reorder my vote for a project
  Given I am logged in as user
  When I got to the votes details page of project with requirements
  And I wait 2 seconds
  Then I reorder my vote with "#vote-stepcollectstepVoteClassement-proposalproposal24" take place of proposal up
  And I wait 2 seconds
  Then I click on button "#confirm-update-votes"

@javascript @database
Scenario: Logged in user wants to set a vote as anonymous
  Given I am logged in as user
  When I got to the votes details page of project with requirements
  And I wait 1 seconds
  And I should not see "admin.fields.idea_vote.private"
  Then I toggle vote access of proposal "#proposal26-proposal-vote__private"
  And I wait 1 seconds
  And I should see "admin.fields.idea_vote.private"
  Then I click on button "#confirm-update-votes"
  And I wait 1 seconds
  Then I reload the page
  And I wait 1 seconds
  And I should see "admin.fields.idea_vote.private"

@javascript @database
Scenario: Logged in user wants to delete a vote
  Given I am logged in as user
  When I got to the votes details page of project with requirements
  And I should see "Proposition 3"
  Then I delete a vote of a proposal "#proposal26-proposal-vote__private"
  And I wait 1 seconds
  And I should see "are-you-sure-you-want-to-delete-this-vote"
  Then I press "btn-delete"
  And I click on button "#confirm-update-votes"
  Then I reload the page
  And I wait 1 seconds
  And I should not see "Proposition 3"

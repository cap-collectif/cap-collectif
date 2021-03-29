@core @debate
Feature: VoteToken

Background:
  Given feature "unstable__debate" is enabled

@database
Scenario: User vote with its token
  And I go to "/voteByToken?token=debateVoteToken1&value=FOR"
  And I wait 1 seconds
  Then I should see "vote.add_success" in the "#symfony-flash-messages" element

Scenario: User tries to use wrong token to vote
  And I go to "/voteByToken?token=wrong&value=FOR"
  And I wait 1 seconds
  Then I should see "invalid-token" in the "#symfony-flash-messages" element

@database
Scenario: User tries to vote twice with its token
  And I go to "/voteByToken?token=debateVoteToken1&value=FOR"
  And I wait 1 seconds
  And I go to "/voteByToken?token=debateVoteToken1&value=FOR"
  And I wait 1 seconds
  Then I should see "invalid-token" in the "#symfony-flash-messages" element

@database
Scenario: User tries to vote with its token but has already voted
  And I go to "/voteByToken?token=debateVoteTokenAlreadyUsed&value=FOR"
  And I wait 1 seconds
  Then I should see "global.already_voted" in the "#symfony-flash-messages" element

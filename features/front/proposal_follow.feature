@proposal_follow
Feature: Proposal Follow

@database @javascript
Scenario: Logged, I want to follow a proposal
  Given I am logged in as user
  And I go to a proposal
  When I click the proposal follow button
  And I wait 2 seconds
  Then I go to the proposal followers tab
  And I should see my subscription as "user" in the proposal followers list

@database @javascript
Scenario: Logged, I want to unfollow a proposal
  Given I am logged in as user
  And I go to a proposal followed by user
  When I click the proposal unfollow button
  And I wait 2 seconds
  Then I go to the proposal followers tab
  And I should not see my subscription on the proposal followers list

@database @javascript
Scenario: Logged, I want to follow then unfollow a proposal
  Given I am logged in as user
  And I go to a proposal
  When I click the proposal follow button
  And I wait 2 seconds
  Then I go to the proposal followers tab
  And I should see my subscription as "user" in the proposal followers list
  Then I click the proposal unfollow button
  And I wait 2 seconds
  And I should not see my subscription as "user" in the proposal followers list

@database @javascript
Scenario: Logged, I want to unfollow then follow a proposal
  Given I am logged in as user
  And I go to a proposal followed by user
  When I click the proposal unfollow button
  And I wait 2 seconds
  Then I go to the proposal followers tab
  And I should not see my subscription on the proposal followers list
  When I click the proposal follow button
  And I wait 2 seconds
  And I should see my subscription as "user" in the proposal followers list

@database @javascript
Scenario: Anonymous user want to follow a proposal
  Given I go to a proposal
  When I click the proposal follow button
  Then I should see a "#login-popover" element

@proposal_follow
Feature: Proposal Follow

@database @javascript
Scenario: Logged, I want to follow a proposal and change the type of following
  Given I am logged in as user
  And I go to a proposal
  When I click the proposal follow button on "proposal2"
  And I wait 2 seconds
  Then I should see a "#proposal-follow-btn-proposal2" element
  And I should see a ".dropdown-menu" element
  And I wait 2 seconds
  And I should see advancement checked on "proposal2"
  And I wait 2 seconds
  Then I click on "proposal follow advancement and comment" choice on "proposal2"
  And I should see follow advancement and comment checked on "proposal2"
  And I wait 2 seconds
  Then I click on "proposal follow all" choice on "proposal2"
  And I should see follow all activities checked on "proposal2"
  And I wait 2 seconds
  Then I go to the proposal followers tab
  And I should see my subscription as "user" in the proposal followers list

@database @javascript 
Scenario: Logged, I want to unfollow a proposal
  Given I am logged in as user
  And I go to a proposal followed by user
  When I click the proposal follow button on "proposal3"
  Then I should see a ".dropdown-menu" element
  And I click the proposal unfollow button on "proposal3"
# TODO  need to be fixed on unfollow mutation by @splyl
#  And I wait 2 seconds
#  Then I go to the proposal followers tab
#  And I should not see my subscription on the proposal followers list

#@database @javascript
#Scenario: Logged, I want to follow then unfollow a proposal
#  Given I am logged in as user
#  And I go to a proposal
#  When I click the proposal follow button on "proposal2"
#  And I wait 2 seconds
#  Then I go to the proposal followers tab
#  And I should see my subscription as "user" in the proposal followers list
#  Then I click the proposal unfollow button on "proposal2"
#  And I wait 2 seconds
#  And I should not see my subscription as "user" in the proposal followers list
#
#@database @javascript
#Scenario: Logged, I want to unfollow then follow a proposal
#  Given I am logged in as user
#  And I go to a proposal followed by user
#  When I click the proposal unfollow button on "proposal3"
#  And I wait 2 seconds
#  Then I go to the proposal followers tab
#  And I should not see my subscription on the proposal followers list
#  When I click the proposal follow button on "proposal3"
#  And I wait 2 seconds
#  And I should see my subscription as "user" in the proposal followers list

@database @javascript
Scenario: Anonymous user want to follow a proposal
  Given I go to a proposal
  When I click the proposal follow button on "proposal2"
  Then I should see a "#login-popover" element

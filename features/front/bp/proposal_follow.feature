@bp @proposal_follow
Feature: Proposal Follow

@database
Scenario: Logged, I want to unfollow a proposal
  Given I am logged in as user
  And I go to a proposal followed by user
  And I wait 3 seconds
  When I click the proposal follow button on "proposal3"
  Then I should see a ".cap-menu__list" element
  And I click the proposal unfollow button on "proposal3"
# TODO  need to be fixed on unfollow mutation by @spyl
#  And I wait 2 seconds
#  Then I go to the proposal followers tab
#  And I should not see my subscription on the proposal followers list

#@database
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
#@database
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

@database
Scenario: Anonymous user want to follow a proposal
  Given I go to a proposal
  When I click the proposal follow button on "proposal2"
  Then I should see a "#login-popover" element

@security @elasticsearch @database
Scenario: On Proposal Preview, Proposal should stay followed after user refresh the page
  Given I am logged in as user
  And I go to a collect step with vote
  And I follow the first proposal
  And I should see "following" before 3 seconds
  Then I go to a collect step with vote
  And I should see "following" before 5 seconds

@security @elasticsearch @database
Scenario: On Proposal Preview, I want to follow a proposal and change the type of following
  Given I go to a collect step with vote
  And I follow the first proposal
  Then I should see a "#login-popover" element

@security @elasticsearch @database
Scenario: On Proposal Preview, I want to follow a proposal and change the type of following and proposal should stay followed with same status after refresh, finally I unfollow and refresh
  Given I am logged in as user
  And I go to a collect step with vote
  And I follow the first proposal
  And I configure my follow option
  And I should see a ".cap-menu__list" element
  Then I change the type of proposal follow with type "essential"
  And I should see proposal followed as "essential"
  Then I go to a collect step with vote
  And I wait 2 seconds
  And I should see "following"
  And I click the ".dropdown-button" element
  And I should see a ".cap-menu__list" element
  And I should see proposal followed as "essential"
  Then I change the type of proposal follow with type "all"
  And I should see proposal followed as "all"
  And I click the ".dropdown-button" element
  And I should see a ".cap-menu__list" element
  Then I change the type of proposal follow with type "minimal"
  And I should see proposal followed as "minimal"
  And I click the ".dropdown-button" element
  And I should see a ".cap-menu__list" element
  Then I click the ".proposal__unfollow" element
  And I wait 2 seconds
  Then I should see "follow"
  And I go to a collect step with vote
  And I wait 2 seconds
  Then I should see "follow"

Scenario: User with true unfollow token wants to connect via email activities link
  When I go to an email notifications preferences link with token "TzbDnxtD-QnB_q3Tvx0m9Wv6lPO25SuV9KmpLOhAY4Q"
  Then I should not be redirected to "/profile/followings"

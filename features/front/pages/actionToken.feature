@core @profile
Feature: ActionToken

@database
Scenario: User unsubscribe itself with its token
  Given I go to "/actionToken?token=user5unsubscribeToken"
  And I wait 1 seconds
  Then I should see "unsubscribe.page.title" in the "h3" element

Scenario: User tries to use wrong token to unsubscribe
  Given I go to "/actionToken?token=wrong"
  And I wait 1 seconds
  Then I should see "invalid-token" in the "#symfony-flash-messages" element

@database
Scenario: User unsubscribe twice with its token
  Given I go to "/actionToken?token=user5unsubscribeToken"
  And I wait 1 seconds
  Then I should see "unsubscribe.page.title" in the "h3" element

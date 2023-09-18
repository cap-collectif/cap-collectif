@core @profile
Feature: ActionToken

@database
Scenario: User unsubscribe itself with its token
  Given I go to "/actionToken?token=user5unsubscribeToken"
  Then I should see "unsubscribe.page.title" within 2 seconds in the "h3" element

Scenario: User tries to use wrong token to unsubscribe
  Given I go to "/actionToken?token=wrong"
  Then I should see "invalid-token" within 2 seconds in the "#symfony-flash-messages" element

@database
Scenario: User unsubscribe twice with its token
  Given I go to "/actionToken?token=user5unsubscribeToken"
  Then I should see "unsubscribe.page.title" within 2 seconds in the "h3" element

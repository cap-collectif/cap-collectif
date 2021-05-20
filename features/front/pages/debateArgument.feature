@core @debate @anonymous
Feature: DebateArgument

Background:
  Given feature unstable__debate is enabled

@database
Scenario: User publish its argument
  Given I go to "/publishDebateArgument?token=jesuisletokendudebateanonymousargumentagainst1"
  And I wait 1 seconds
  Then I should see "argument.published.confirmation" in the "#symfony-flash-messages" element

Scenario: User tries to use wrong token to publish its argument
  Given I go to "/publishDebateArgument?token=jenexistepas"
  And I wait 1 seconds
  Then I should see "invalid-token" in the "#symfony-flash-messages" element

Scenario: User tries to publish already publoshed argument
  Given I go to "/publishDebateArgument?token=jesuisletokendudebateanonymousargumentfor1"
  And I wait 1 seconds
  Then I should see "argument.published.already" in the "#symfony-flash-messages" element

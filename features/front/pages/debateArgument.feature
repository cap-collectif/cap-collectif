@core @debate @anonymous
Feature: DebateArgument

Background:
  Given feature unstable__debate is enabled

@database
Scenario: User publish its argument
  Given I go to "/publishDebateArgument?token=jesuisletokendudebateanonymousargumentagainst1"
  Then I should see "argument.published.confirmation" within 2 seconds in the "#symfony-flash-messages" element

Scenario: User tries to use wrong token to publish its argument
  Given I go to "/publishDebateArgument?token=jenexistepas"
  Then I should see "invalid-token" within 2 seconds in the "#symfony-flash-messages" element

Scenario: User tries to publish already publoshed argument
  Given I go to "/publishDebateArgument?token=jesuisletokendudebateanonymousargumentfor1"
  Then I should see "argument.published.already" within 2 seconds in the "#symfony-flash-messages" element

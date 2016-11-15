@newsletter
Feature: Newsletter

  Background:
    Given feature "newsletter" is enabled

  @database @javascript
  Scenario: Can subscribe to the Newsletter
  Given I visited "home page"
  When I fill in the following:
    | newslettersubscription_email  | iwantsomenews@gmail.com  |
  And I press "S'inscrire"
  Then I should see "Merci ! Votre inscription a bien été prise en compte."

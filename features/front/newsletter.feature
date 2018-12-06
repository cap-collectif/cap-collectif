@core @newsletter
Feature: Newsletter

Background:
  Given feature "newsletter" is enabled

@database
Scenario: Can subscribe to the Newsletter
  Given I visited "home page"
  When I fill in the following:
    | newsletter_subscription_email  | iwantsomenews@gmail.com  |
  And I press "homepage.newsletter.submit"
  Then I should see "homepage.newsletter.success" in the "#symfony-flash-messages" element

@emails
Feature: Email

  @database @javascript
  Scenario: Not confirmed user can confirm his email
    Given feature "registration" is enabled
    When I am on "/email-confirmation/azertyuiop"
    Then I can see I am logged in as "user_not_confirmed"
    And I should not be asked to confirm my email

  @database @javascript
  Scenario: Expired user can confirm his email to reactivate his account
    Given feature "registration" is enabled
    When I am on "/email-confirmation/wxcvbn"
    Then I can see I am logged in as "user_expired"
    And I should not be asked to confirm my email

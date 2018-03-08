@confirmation
Feature: Confirmation

@javascript
Scenario: A user not confirmed should be asked to confirm his email
  Given I am logged in as user_not_confirmed
  Then I should be asked to confirm my email "user_not_confirmed@test.com"

@javascript
Scenario: A user confirmed user should not be asked to confirm his email
  Given I am logged in as user
  Then I should not be asked to confirm my email

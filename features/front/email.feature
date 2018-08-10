@emails
Feature: Email

@database @javascript
Scenario: Not confirmed user can confirm his email
  Given feature "registration" is enabled
  When I am on "/account/email_confirmation/azertyuiop"
  Then I can see I am logged in as "user_not_confirmed"
  And I should not be asked to confirm my email

@database @javascript
Scenario: User can update his email
  When I am on "/account/new_email_confirmation/check-my-new-email-token"
  Then I can see I am logged in as "user_updating_email"
  And I should not be asked to confirm my email
  And user "user_updating_email" should have email "new-email-to-confirm@test.com"

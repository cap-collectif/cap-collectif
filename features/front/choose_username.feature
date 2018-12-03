Feature: Choose username

@javascript @database
Scenario: A username with no name should see be ask to set a username
  Given I am logged in as no_name
  And I fill in the following:
    | account__username    | This is my name |
  And I press "confirm-username-form-submit"
  And I wait 3 seconds
  Then I can see I am logged in as "This is my name"

@admin @group
Feature: User Admin

@dev
Scenario: Logged in super admin wants to edit a user profile
  Given I am logged in as admin
  Then I go to the admin group list page
  And I wait "#add-group" to appear on current page
  And I click on button "#add-group"
  Then I should see "group.create.title"



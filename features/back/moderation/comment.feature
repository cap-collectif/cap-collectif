@comments
Feature: Comments features

Background:
  Given I am logged in as admin

@database
Scenario: Logged in admin wants to go to the comment list page
  Given I go to the admin comment list page
  Then I should see "admin.fields.comment.body"

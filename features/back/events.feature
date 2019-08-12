@events
Feature: Events features

@database
Scenario: Logged in admin wants to import events
  Given I am logged in as admin
  And I go to the admin event list page
  And I open the import events modal
  And I attach the file "/var/www/features/files/events_to_import.csv" to "events"
  And I wait 2 seconds
  Then I should see 'count-events-found {"num":2}'
  And I can confirm my events import

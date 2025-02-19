@admin @project @events
Feature: Events features

# if we can access admin-next pages in capco.test rewrite it someday #14869
#@database
#Scenario: Logged in admin wants to import events
#  Given I am logged in as admin
#  And I go to the admin event list page
#  And I open the import events modal
#  And I attach the file "/var/www/features/files/events_to_import.csv" to "events"
#  And I wait 2 seconds
#  Then I should see 'count-events-found {"num":2}'
#  And I can confirm my events import

@ready-only
Scenario: Anonymous user can see events linked to a specific step
  Given feature calendar is enabled
  And I go to the collect step IDF
  # Here we check that events appear on the page
  Then I wait ".eventPreview" to appear on current page

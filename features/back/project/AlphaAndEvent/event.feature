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

@database
Scenario: Logged in admin wants to add a new event
  Given I am logged in as admin
  And features themes, calendar, projects are enabled
  And I go to the admin event create page
  Then fill in "event_title" with "test"
  And I fill the authors field with name 'adminpro'
  And I fill the address field
  And I fill in "event_body" with "My body"
  And I fill date field "#event_input_startAt" with value '2030-08-17 12:13:14'
  And I attach the file "/var/www/features/files/image.jpg" to "event_media_field"
  And I fill the theme filter with value "Immobilier"
  And I fill the project filter with value 'Croissance'
  And I fill in "metadescription" with "Common on a react event to speak about how to fire our president"
  And I fill in "customcode" with "<script>console.log('I m an xss fail');</script>"
  Then I click on button "#confirm-event-create"
  And I should be redirected to "|^/admin/capco/app/event/[0-9a-z-]+/edit$|" as regex
  Then I go to event page with slug "test"
  And I should see a ".eventContent" element

@ready-only
Scenario: Logged in admin can review an event
  Given I am logged in as admin
  Given features themes, projects are enabled
  And I go to admin event page with eventId "eventCreateByAUserReviewAwaiting"
  And I wait "#confirm-event-edit" to appear on current page

@ready-only
Scenario: Logged in admin can see an event approved
  Given I am logged in as admin
  Given features themes, projects are enabled
  And I go to admin event page with eventId "eventCreateByAUserReviewApproved"

@ready-only
Scenario: Logged in admin can see an event refused
  Given I am logged in as admin
  Given features themes, projects are enabled
  And I go to admin event page with eventId "eventCreateByAUserReviewRefused"

@database
Scenario: Logged in admin wants to edit an event; feature allow_users_to_propose_events is not enabled
  Given I am logged in as admin
  And features themes, projects are enabled
  And I go to admin event page with eventId "event10"
  Then fill in "event_title" with "edit"
  And I fill the authors field with name 'admin'
  And I fill the address field
  And I fill in "event_body" with "My body"
  And I fill date field "#event_input_startAt" with value '2050-08-17 12:13:14'
  And I attach the file "/var/www/features/files/image.jpg" to "event_media_field"
  And I fill the theme filter with value "Immobilier"
  And I fill the project filter with value 'Croissance'
  And I fill in "metadescription" with "Common on a react event to speak about how to fire our president"
  And I fill in "customcode" with "<script>console.log('I m an xss fail');</script>"
  Then I click on button "#confirm-event-edit"

@database
Scenario: Logged in super admin wants to delete an event
  Given I am logged in as super admin
  Given features themes, projects are enabled
  And I go to admin event page with eventId "event10"
  And I wait "#delete-event" to appear on current page
  When I click on button "#delete-event"
  Then I should see "event.alert.delete" within 5 seconds
  And I click on button "#delete-modal-button-delete"
  Then I should be redirected to "/admin-next/events"
  And I should not see "event10"

@ready-only
Scenario: Logged in admin wants to delete an event
  Given I am logged in as admin
  Given features themes, projects are enabled
  And I go to admin event page with eventId "event10"
  And I should not see "global.delete"

@database
Scenario: Logged in admin wants to delete his event
  Given I am logged in as admin
  Given features themes, projects are enabled
  And I go to admin event page with eventId "event4"
  And I wait "#delete-event" to appear on current page
  When I click on button "#delete-event"
  Then I should see "event.alert.delete" within 5 seconds
  And I click on button "#delete-modal-button-delete"
  Then I should be redirected to "/admin-next/events" within 5 seconds
  And I should not see "event4"

@database @rabbimq
Scenario: Logged in admin can approve an awaiting event
  Given I am logged in as admin
  And features themes, projects, allow_users_to_propose_events, calendar are enabled
  When I go to admin event page with eventId "eventCreateByAUserReviewAwaiting"
  And event fields should be disabled
  And event fields should be enabled
  And I click on button "#approved_button"
  And I click on button "#confirm-event-edit"
  And I wait "global.saved" to appear on current page in "body"
  And I visited "events page"
  And I should see "event Create By user with review in awaiting" within 20 seconds

@database @rabbimq
Scenario: Logged in admin can refuse an awaiting event
  Given I am logged in as admin
  Given features themes, projects, allow_users_to_propose_events, calendar are enabled
  And I go to admin event page with eventId "eventCreateByAUserReviewAwaiting"
  And event fields should be disabled
  Then I click on button "#refused_button"
  And I wait "#event_refusedReason" to appear on current page
  And I select "spam" as refused reason
  Then I click on button "#confirm-event-edit"
  And I wait "global.saved" to appear on current page in "body"
  And I visited "events page"
  And I should not see "event Create By user with review in awaiting"

@ready-only
Scenario: Logged in admin want to moderate a refused event
  Given I am logged in as admin
  Given features themes, projects, allow_users_to_propose_events, calendar are enabled
  And I go to admin event page with eventId "eventCreateByAUserReviewRefused"
  And event fields should be disabled
  And event moderation should be disabled
  And I should not see an "#confirm-event-edit" element

@ready-only
Scenario: Logged in admin want to moderate a accepted event
  Given I am logged in as admin
  Given features themes, projects, allow_users_to_propose_events, calendar are enabled
  And I go to admin event page with eventId "eventCreateByAUserReviewApproved"
  And event fields should be disabled
  And event moderation should be disabled

@database @rabbitmq
Scenario: Logged in super admin want to moderate a accepted event
  Given I am logged in as super admin
  Given features themes, projects, allow_users_to_propose_events, calendar are enabled
  And I go to admin event page with eventId "eventCreateByAUserReviewApproved"
  And I should see an "#confirm-event-edit" element
  Then I click on button "#refused_button"
  And I wait "#event_refusedReason" to appear on current page
  And I select "spam" as refused reason
  Then I click on button "#confirm-event-edit"
  And I wait "global.saved" to appear on current page in "body"

@ready-only
Scenario: Anonymous user can see events linked to a specific step
  Given feature calendar is enabled
  And I go to the collect step IDF
  # Here we check that events appear on the page
  Then I wait ".eventPreview" to appear on current page

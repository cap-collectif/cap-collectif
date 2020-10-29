@admin @project @events
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

@database
Scenario: Logged in admin wants to add a new event
  Given I am logged in as admin
  And features themes, calendar, projects are enabled
  And I go to the admin event create page
  Then fill in "event_title" with "test"
  And I fill the authors field with name 'adminpro'
  And I fill the address field
  Then I should see "adminpro"
  And I fill in "event_body" with "My body"
  And I fill date field "#event_input_startAt" with value '2030-08-17 12:13:14'
  And I attach the file "/var/www/features/files/image.jpg" to "event_media_field"
  And I fill the theme filter with value "Immobilier"
  And I fill the project filter with value 'Croissance'
  And I fill in "metadescription" with "Common on a react event to speak about how to fire our president"
  And I fill in "customcode" with "<script>console.log('I m an xss fail');</script>"
  Then I click on button "#confirm-event-create"
  And I wait 3 seconds
  Then I go to event page with slug "test"
  And I should see "17 août 2030 à 12:13" appear on current page in "body"

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
  Then I should see "event.alert.delete"
  And I click on button "#delete-modal-button-delete"
  And I wait 3 seconds
  Then I should be redirected to "/admin/capco/app/event/list"
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
  Then I should see "event.alert.delete"
  And I click on button "#delete-modal-button-delete"
  And I wait 3 seconds
  Then I should be redirected to "/admin/capco/app/event/list"
  And I should not see "event4"

@database @rabbimq
Scenario: Logged in admin can approve an awaiting event
  Given I am logged in as admin
  And features themes, projects, allow_users_to_propose_events, calendar are enabled
  When I go to admin event page with eventId "eventCreateByAUserReviewAwaiting"
  And event fields should be disabled
  And I click on button "#approved_button"
  And I click on button "#confirm-event-edit"
  And I wait "global.saved" to appear on current page in "body"
  And I visited "events page"
  And I should see "event Create By user with review in awaiting"

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

@database
Scenario: Logged in admin wants to use jitsi for a remote event on a previously non remote event
  Given I am logged in as admin
  And features projects, unstable__remote_events, allow_users_to_propose_events, calendar are enabled
  And I go to admin event page with eventId "eventCreateByAUserReviewApproved"
  And I should not see "global.animator"
  And I should not see ".replay-container" in the "body" element
  And I click on button "#remote"
  Then I wait "#event_animator" to appear on current page
  And I wait ".replay-container" to appear on current page
  Then I click on button "#confirm-event-edit"
  And I wait "global.saved" to appear on current page in "body"
  Then I go to event page with slug "event-create-by-user-with-review-approved"
  Then I wait "#jitsi-container" to appear on current page

@ready-only
Scenario: Logged in animator can join jitsi room before it starts
  Given I am logged in as agui
  And features unstable__remote_events, calendar are enabled
  Then I go to event page with slug "on-vous-presente-agui-lami-du-bp"
  Then I can participate in jitsi room

@ready-only
Scenario: Anonymous user can not participate to a not started remote event
  Given features unstable__remote_events, projects, calendar are enabled
  When I go to event page with slug "on-vous-presente-agui-lami-du-bp"
  Then I can not participate in jitsi room

@database
Scenario: Anonymous user can participate to a started remote event
  Given features unstable__remote_events, projects, calendar are enabled
  And I set currentDate as the start event date for event "eventRemote"
  When I go to event page with slug "on-vous-presente-agui-lami-du-bp"
  Then I can participate in jitsi room

@ready-only
Scenario: Anonymous user can see the replay of a past event
  Given features unstable__remote_events, projects, calendar are enabled
  When I go to event page with slug "de-tech-dans-la-civictech-cest-quoi-une-api"
  Then I can see the jitsi replay

@ready-only
Scenario: Anonymous user can see events linked to a specific step
  Given feature calendar is enabled
  And I go to the collect step IDF
  # Here we check that events appear on the page
  Then I wait ".eventPreview" to appear on current page

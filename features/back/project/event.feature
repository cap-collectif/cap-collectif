@event @event_back
Feature: Event features

@database
Scenario: Logged in admin wants to add a new event
  Given I am logged in as admin
  Given features themes, projects are enabled
  And I go to the admin event list page
  Then I click on create button
  And I should be on "/admin/capco/app/event/create"
  Then I wait "#event_startAt" to appear on current page
  And I fill date field "event_startAt" with value '2050-05-05 12:12:12'
  And I wait "#event_title" to appear on current page
  Then fill in "event_title" with "test"
  And I fill the authors field
  And I fill the address field
  And I fill in "event_body" with "My body"
  Then I wait "#event_startAt" to appear on current page
  And I fill date field "event_startAt" with value '2050-05-05 12:12:12'
  And I attach the file "/var/www/features/files/image.jpg" to "event_media_field"
  And I fill the theme filter
  And I fill the project filter
  And I fill in "custom.metadescription" with "Common on a react event to speak about how to fire our president"
  And I fill in "custom.customcode" with "<script>alert('I m an xsss fail');</script>"
  Then I click on button "#confirm-event-create"
  And I wait 1 seconds
  And I should see "global.saved"

@database
Scenario: Logged in admin wants to edit an event
  Given I am logged in as admin
  Given features themes, projects are enabled
  And I go to admin event page with eventId "event10"
  And I wait "#event_title" to appear on current page
  Then fill in "event_title" with "test"
  And I fill the authors field
  And I fill the address field
  And I fill in "event_body" with "My body"
  And I fill the start field "event_startAt"
  And I attach the file "/var/www/features/files/image.jpg" to "event_media_field"
  And I fill the theme filter
  And I fill the project filter
  And I fill in "custom.metadescription" with "Common on a react event to speak about how to fire our president"
  And I fill in "custom.customcode" with "<script>alert('I m an xsss fail');</script>"
  Then I click on button "#confirm-event-edit"
  And I wait 1 seconds
  And I should see "global.saved"

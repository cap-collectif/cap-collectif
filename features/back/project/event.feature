@event @event_back
Feature: Event features

@database
Scenario: Logged in admin wants to add a new event
  Given I am logged in as admin
  Given features themes, projects are enabled
  And I go to the admin event list page
  Then I click on create button
  And I should be on "/admin/capco/app/event/create"
  And I wait "#event_title" to appear on current page
  Then fill in "event_title" with "test"
  And I fill the authors field
  And I fill the address field
  And I fill in "event_body" with "My body"
  And I fill date field "#event_input_startAt" with value '2030-08-17 12:13:14'
  And I attach the file "/var/www/features/files/image.jpg" to "event_media_field"
  And I fill the theme filter with value "Immobilier"
  And I fill the project filter with value 'Croissance'
  And I fill in "custom.metadescription" with "Common on a react event to speak about how to fire our president"
  And I fill in "custom.customcode" with "<script>alert('I m an xss fail');</script>"
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
  And I fill date field "#event_input_startAt" with value '2050-08-17 12:13:14'
  And I attach the file "/var/www/features/files/image.jpg" to "event_media_field"
  And I fill the theme filter with value "Immobilier"
  And I fill the project filter with value 'Croissance'
  And I fill in "custom.metadescription" with "Common on a react event to speak about how to fire our president"
  And I fill in "custom.customcode" with "<script>alert('I m an xss fail');</script>"
  Then I click on button "#confirm-event-edit"
  And I wait 1 seconds
  And I should see "global.saved"

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

@database
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

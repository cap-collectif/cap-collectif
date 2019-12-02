@core @event_registration @events
Feature: Event Registration

Background:
  Given feature "calendar" is enabled

@database
Scenario: Anonymous user wants to register an event anonymously
  Given I visited eventpage with:
  | slug | event-without-registrations |
  When I fill in the following:
  | capco_event_registration_username        | Naruto42             |
  | capco_event_registration_email           | naruto42@gmail.com   |
  And I check "capco_event_registration_private"
  And I press "event_registration.create.submit"
  Then I should see "global.anonymous" in the "#eventRegistrationModal" element

@database
Scenario: Anonymous wants to register an event
  Given I visited eventpage with:
  | slug | event-without-registrations |
  When I fill in the following:
  | capco_event_registration_username        | Naruto42             |
  | capco_event_registration_email           | naruto42@gmail.com   |
  And I press "event_registration.create.submit"
  Then I should see "Naruto42" in the "#eventRegistrationModal" element

@database
Scenario: Anonymous wants to register an event with existing email
  Given "naruto42@gmail.com" is registered to event "event-without-registrations"
  Given I visited eventpage with:
  | slug | event-without-registrations |
  When I fill in the following:
  | capco_event_registration_username        | Naruto42             |
  | capco_event_registration_email           | naruto42@gmail.com   |
  And I press "event_registration.create.submit"
  Then I should see "event_registration.create.listed_email" in the '#main' element

@database
Scenario: logged user wants to register an event anonymously
  Given I am logged in as user
  And I visited eventpage with:
  | slug | event-without-registrations |
  And I check "capco_event_registration_private"
  When I press "event_registration.create.register"
  Then I should see "global.anonymous" in the "#eventRegistrationModal" element

@database
Scenario: logged user wants to register an event
  Given I am logged in as user
  And I visited eventpage with:
  | slug | event-without-registrations |
  When I press "event_registration.create.register"
  Then I should see "user" in the "#eventRegistrationModal" element
  Then I should see "event_registration.unsubscribe" in the '#main' element

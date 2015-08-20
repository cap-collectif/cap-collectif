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
    And I press "S'inscrire à l'événement"
    Then I should see "Anonyme" in the "#eventRegistrationModal" element

  @database
  Scenario: Anonymous wants to register an event
    Given I visited eventpage with:
    | slug | event-without-registrations |
    When I fill in the following:
    | capco_event_registration_username        | Naruto42             |
    | capco_event_registration_email           | naruto42@gmail.com   |
    And I press "S'inscrire à l'événement"
    Then I should see "Naruto42" in the "#eventRegistrationModal" element

  @database
  Scenario: Anonymous wants to register an event with existing email
    Given "naruto42@gmail.com" is registered to event "event-without-registrations"
    Given I visited eventpage with:
    | slug | event-without-registrations |
    When I fill in the following:
    | capco_event_registration_username        | Naruto42             |
    | capco_event_registration_email           | naruto42@gmail.com   |
    And I press "S'inscrire à l'événement"
    Then I should see "Cette adresse électronique a déjà été utilisée pour s'inscrire à l'événement."

  @database
  Scenario: logged user wants to register an event anonymously
    Given I am logged in as user
    And I visited eventpage with:
    | slug | event-without-registrations |
    And I check "capco_event_registration_private"
    When I press "S'inscrire"
    Then I should see "Anonyme" in the "#eventRegistrationModal" element

  @database
  Scenario: logged user wants to register an event
    Given I am logged in as user
    And I visited eventpage with:
    | slug | event-without-registrations |
    When I press "S'inscrire"
    Then I should see "user" in the "#eventRegistrationModal" element
    Then I should see "Se désinscrire"

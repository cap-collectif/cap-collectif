@events
Feature: Events

Background:
  Given feature "calendar" is enabled

@parallel-scenario
Scenario: Anonymous wants to list events
  Given I visited "events page"
  Then I should see 8 ".event" elements

@parallel-scenario
Scenario: Anonymous wants to list archived events
  Given I visited "events page"
  And I should see 'event.index.appendices.archived.number {"%count%":"2"}'
  And I follow "event.see_archived"
  Then I should see 2 ".event" elements

@javascript
Scenario: Events can be filtered by projects
  Given I visited "events page"
  And I select "Croissance, innovation, disruption" from "event_search_project"
  And I wait 2 seconds
  Then I should see 2 ".event" elements
  And I should see "Event with registrations"
  # And I should see "Event without registrations"

@javascript
Scenario: Archived events can be filtered by projects
  Given I visited "events page"
  And I follow "event.see_archived"
  And I select "Croissance, innovation, disruption" from "event_search_project"
  And I wait 2 seconds
  Then I should see 1 ".event" elements
  And I should see "PHPTour2014"
  And I should not see "ParisWeb2014"

@javascript
Scenario: Events can be filtered by theme
  Given feature "themes" is enabled
  And I visited "events page"
  And I select "Justice" from "event_search_theme"
  And I wait 1 seconds
  Then I should see 1 ".event" elements
  And I should see "Event with registrations"
  And I should not see "ParisWeb2015"

@javascript
Scenario: Archived events can be filtered by theme
  Given feature "themes" is enabled
  And I visited "events page"
  And I follow "event.see_archived"
  And I select "Justice" from "event_search_theme"
  And I wait 1 seconds
  Then I should see 1 ".event" elements
  And I should see "PHPTour2014"
  And I should not see "ParisWeb2014"

@javascript
Scenario: Events can be filtered by title
  Given I visited "events page"
  When I fill in the following:
    | event_search_term | without |
  And I click the ".filter__search .btn" element
  And I wait 1 seconds
  Then I should see 1 ".event" elements
  And I should see "Event without registrations"
  And I should not see "Event with registrations"

@javascript
Scenario: Archived events can be filtered by title
  Given I visited "events page"
  And I follow "event.see_archived"
  When I fill in the following:
    | event_search_term | ParisWeb2014 |
  And I click the ".filter__search .btn" element
  And I wait 1 seconds
  Then I should see 1 ".event" elements
  And I should see "ParisWeb2014"
  And I should not see "PHPTour2014"

@database @javascript
Scenario: Anonymous wants to comment an event
  Given I visited eventpage with:
    | slug | event-with-registrations |
  And I wait 1 seconds
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I fill in the following:
    | authorName  | Naruto              |
    | authorEmail | naruto72@gmail.com  |
  When I press "comment.submit"
  And I wait 2 seconds
  Then I should see "J'ai un truc à dire" in the ".opinion__list" element

@database @javascript
Scenario: Logged in user wants to comment an event
  Given I am logged in as user
  And I visited eventpage with:
    | slug | event-with-registrations |
  And I wait 1 seconds
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I should not see "comment.with_my_account"

@javascript
Scenario: Anonymous wants to comment an event without email
  Given I visited eventpage with:
    | slug | event-with-registrations |
  And I wait 1 seconds
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I fill in the following:
    | authorName  | Naruto              |
  When I press "comment.submit"
  And I wait 2 seconds
  Then I should not see "J'ai un truc à dire" in the ".opinion__list" element

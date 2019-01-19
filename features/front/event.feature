#TODO tests to display/hide map, test on pagination
@core @events
Feature: Events

Background:
  Given feature "calendar" is enabled

@parallel-scenario
Scenario: Anonymous wants to list events
  Given I visited "events page"
  And I wait ".event" to appear on current page
  Then I should see 10 ".event" elements

Scenario: Anonymous wants to list archived events
  Given I visited "events page"
  And I should see 'event.index.appendices.archived.number {"%count%":3}'
  And I follow "event.see_archived"
  Then I should see 3 ".event" elements

Scenario: Events can be filtered by projects
  Given feature "projects_form" is enabled
  And I visited "events page"
  And I click the "#event-button-filter" element
  And I wait 3 seconds
  And I select and click "Croissance, innovation, disruption" from react "#EventListFilters-filter-project"
  Then I should see 3 ".event" elements
  And I should see "Event with registrations"
  # And I should see "Event without registrations"

Scenario: Archived events can be filtered by projects
  Given I visited "events page"
  And I follow "event.see_archived"
  And I select "Croissance, innovation, disruption" from "event_search_project"
  And I wait 2 seconds
  Then I should see 1 ".event" elements
  And I should see "evenementPasseSansDateDeFin"
  And I should not see "ParisWeb2014"

Scenario: Events can be filtered by theme
  Given feature "themes" is enabled
  And I visited "events page"
  And I click the "#event-button-filter" element
  And I select "Justice" from react "#EventListFilters-filter-theme"
  And I wait 1 seconds
  Then I should see 1 ".event" elements
  And I should see "Event with registrations"
  And I should not see "ParisWeb2015"

Scenario: Archived events can be filtered by theme
  Given feature "themes" is enabled
  And I visited "events page"
  And I follow "event.see_archived"
  And I select "Justice" from "event_search_theme"
  And I wait 1 seconds
  Then I should see 1 ".event" elements
  And I should see "evenementPasseSansDateDeFin"
  And I should not see "PHPTourDuFuture"

Scenario: Events can be filtered by title
  Given I visited "events page"
  When I fill in the following:
    | event-search-input | without |
  And I wait 1 seconds
  Then I should see 1 ".event" elements
  And I should see "Event without registrations"
  And I should not see "Event with registrations"

Scenario: Archived events can be filtered by title
  Given I visited "events page"
  And I follow "event.see_archived"
  When I fill in the following:
    | event_search_term | ParisWeb2014 |
  And I click the ".filter__search .btn" element
  And I wait 1 seconds
  Then I should see 1 ".event" elements
  And I should see "ParisWeb2014"
  And I should not see "evenementPasseSansDateDeFin"

@database
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

@database
Scenario: Logged in user wants to comment an event
  Given I am logged in as user
  And I visited eventpage with:
    | slug | event-with-registrations |
  And I wait 1 seconds
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I should not see "comment.with_my_account"

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

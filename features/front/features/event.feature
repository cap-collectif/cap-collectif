#TODO tests to display/hide map, test on pagination
@core @events
Feature: Events

Background:
  Given feature "calendar" is enabled

@parallel-scenario
Scenario: Anonymous wants to list events
  Given I visited "events page"
  And I wait ".eventPreview" to appear on current page
  Then I should see 11 ".eventPreview" elements

Scenario: Events can be filtered by projects
  Given feature "projects_form" is enabled
  And I visited "events page"
  And I wait ".eventPreview" to appear on current page
  And I click the "#event-button-filter" element
  And I select "UHJvamVjdDpwcm9qZWN0MQ==" from react "#SelectProject-filter-project"
  And I wait 1 seconds
  Then I should see 3 ".eventPreview" elements
  And I click the "#event-status-filter-button-desktop" element
  And I check element "finished-events"
  And I wait 2 seconds
  Then I should see 1 ".eventPreview" elements

Scenario: Events can be filtered by theme
  Given feature "themes" is enabled
  And I visited "events page"
  And I wait ".eventPreview" to appear on current page
  And I click the "#event-button-filter" element
  And I select "Justice" from react "#SelectTheme-filter-theme"
  And I wait 1 seconds
  Then I should see 1 ".eventPreview" elements
  And I should see "Event with registrations"
  And I should not see "ParisWeb2015"

Scenario: Archived events can be filtered by theme
  Given feature "themes" is enabled
  And I visited "events page"
  And I wait ".eventPreview" to appear on current page
  And I click the "#event-button-filter" element
  And I select "Justice" from react "#SelectTheme-filter-theme"
  And I click the "#event-status-filter-button-desktop" element
  And I check element "finished-events"
  And I wait ".loader" to appear on current page
  And I wait ".eventPreview" to appear on current page
  Then I should see 1 ".eventPreview" elements
  And I should see "evenementPasseSansDateDeFin"
  And I should not see "PHPTourDuFuture"

Scenario: Events can be filtered by title
  Given I visited "events page"
  And I wait ".eventPreview" to appear on current page
  When I fill in the following:
    | event-search-input | without |
  And I wait 1 seconds
  Then I should see 1 ".eventPreview" elements
  And I should see "Event without registrations"
  And I should not see "Event with registrations"

Scenario: Archived events can be filtered by title
  Given I visited "events page"
  And I wait ".eventPreview" to appear on current page
  And I click the "#event-status-filter-button-desktop" element
  And I check element "finished-events"
  When I fill in the following:
    | event-search-input | ParisWeb2014 |
  And I wait 1 seconds
  Then I should see 1 ".eventPreview" elements
  And I should see "ParisWeb2014"
  And I should not see "evenementPasseSansDateDeFin"

@database
Scenario: Anonymous wants to comment an event
  Given I visited eventpage with:
    | slug | event-with-registrations |
  And I wait "#CommentForm" to appear on current page
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I fill in the following:
    | authorName  | Naruto              |
    | authorEmail | naruto72@gmail.com  |
  When I press "comment.submit"
  And I wait 2 seconds
  Then I should see "J'ai un truc à dire" in the "#CommentListViewPaginated" element

@database
Scenario: Logged in user wants to comment an event
  Given I am logged in as user
  And I visited eventpage with:
    | slug | event-with-registrations |
  And I wait "#CommentForm" to appear on current page
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I should not see "comment.with_my_account"

@database
Scenario: Anonymous wants to comment an event without email
  Given I visited eventpage with:
    | slug | event-with-registrations |
  And I wait "#CommentForm" to appear on current page
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I fill in the following:
    | authorName  | Naruto              |
  When I press "comment.submit"
  And I wait 2 seconds
  Then I should not see "J'ai un truc à dire" in the "#CommentListViewPaginated" element

Scenario: Anonymous wants to create an event
  Given feature "allow_users_to_propose_events" is enabled
  And I visited "events page"
  And I wait "#btn-create-event" to appear on current page
  When I click on button "#btn-create-event"
  Then I should see a "#login-popover" element

@database
Scenario: Logged in user wants to create an event
  Given I am logged in as user
  Given features themes, projects, allow_users_to_propose_events, calendar are enabled
  And I visited "events page"
  And I wait "#btn-create-event" to appear on current page
  When I click on button "#btn-create-event"
  Then I should see a "#confirm-event-submit" element
  And I wait "#event_title" to appear on current page
  Then fill in "event_title" with "My event"
  And I fill the address field
  And I fill in "event_body" with "My body"
  And I fill date field "#event_input_startAt" with value '2050-08-17 12:13:14'
  And I fill the project filter with value 'Croissance'
  When I click on button "#confirm-event-submit"
  Then I should be redirected to '/events/my-event'
  And I wait "#event-label-status" to appear on current page
  Then I should see "waiting-examination"

@database
Scenario: Logged in user wants to edit his refused event
  Given I am logged in as user
  And feature "allow_users_to_propose_events" is enabled
  And I visited "events page"
  And I wait "#btn-create-event" to appear on current page
  And I should see "event Create By user with review refused"
  Then I follow "event Create By user with review refused"
  And I wait "#edit-button" to appear on current page
  And I click on button "#edit-button"
  And I wait "#event_title" to appear on current page
  Then fill in "event_title" with "My event edited"
  When I click on button "#confirm-event-submit"
  Then I should be redirected to '/events/event-create-by-user-with-review-refused'
  And I wait "#event-label-status" to appear on current page
  Then I wait "waiting-examination" to appear on current page in "#event-label-status"

Scenario: Feature allow users to propose events is disabled
  Given feature "allow_users_to_propose_events" is disabled
  And I visited "events page"
  Then I should not see "event-proposal"

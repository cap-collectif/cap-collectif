Feature: Events

Background:
  Given feature "calendar" is enabled

@database @javascript
Scenario: Anonymous wants to comment an event
  Given I visited "events page"
  And I follow "Event with registrations"
  And I wait 3 seconds
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I fill in the following:
    | authorName  | Naruto              |
    | authorEmail | naruto72@gmail.com  |
  When I press "Commenter"
  And I wait 3 seconds
  Then I should see "J'ai un truc à dire" in the ".opinion__list" element

@database @javascript
Scenario: Logged in user wants to comment an event
  Given I am logged in as user
  And I visited "events page"
  And I follow "Event with registrations"
  And I wait 3 seconds
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I should not see "Commenter avec mon compte"
  And I should not see "Commenter sans créer de compte"
  When I press "Commenter"
  And I wait 3 seconds
  Then I should see "J'ai un truc à dire" in the ".opinion__list" element

@javascript
Scenario: Anonymous wants to comment an event without email
  Given I visited "events page"
  And I follow "Event with registrations"
  And I wait 3 seconds
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I fill in the following:
    | authorName  | Naruto              |
  When I press "Commenter"
  And I wait 5 seconds
  Then I should not see "J'ai un truc à dire" in the ".opinion__list" element

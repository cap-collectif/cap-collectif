Feature: Events

@datbase @javascripts @test
Scenario: Can comment an event
  Given feature "calendar" is enabled
  And I visited "events page"
  And I follow "Event with registrations"
  And I should see "Commenter avec mon compte"
  And I fill in the following:
    | capco_app_comment[authorName]  | Naruto              |
    | capco_app_comment[authorEmail] | naruto72@gmail.com  |
    | capco_app_comment[body]        | J'ai un truc à dire |
  When I press "Commenter"
  Then I should see "Merci ! Votre commentaire a bien été enregistré."

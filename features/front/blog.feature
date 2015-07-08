Feature: News

Background:
  Given feature "blog" is enabled

@database @javascript
Scenario: Anonymous wants to comment a blogpost
  Given I visited "blog page"
  And I follow "Post 2"
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
Scenario: Logged in user wants to comment a blogpost
  Given I am logged in as user
  And I visited "blog page"
  And I follow "Post 2"
  And I wait 3 seconds
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I should not see "Commenter avec mon compte"
  And I should not see "Commenter sans créer de compte"
  When I press "Commenter"
  And I wait 3 seconds
  Then I should see "J'ai un truc à dire" in the ".opinion__list" element

@javascript
Scenario: Anonymous wants to comment a blogpost without email
  Given I visited "blog page"
  And I follow "Post 2"
  And I wait 3 seconds
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I fill in the following:
    | authorName  | Naruto              |
  When I press "Commenter"
  And I wait 5 seconds
  Then I should not see "J'ai un truc à dire" in the ".opinion__list" element

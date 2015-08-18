Feature: News

Background:
  Given feature "blog" is enabled

Scenario: Anonymous wants to list posts
  Given I visited "blog page"
  Then I should see 10 ".media--news" elements

@javascript
Scenario: Posts can be filtered by consultations
  Given I visited "blog page"
  And I select "Croissance, innovation, disruption" from "capco_app_search_blog_consultation"
  And I wait 5 seconds
  Then I should see 5 ".media--news" elements
  And I should see "Post 5"
  And I should not see "Post 8"

@javascript
Scenario: Post can be filtered by theme
  Given feature "themes" is enabled
  And I visited "blog page"
  And I select "Justice" from "capco_app_search_blog_theme"
  And I wait 5 seconds
  Then I should see 5 ".media--news" elements
  And I should see "Post 8"
  And I should not see "Post 2"

@database @javascript
Scenario: Anonymous wants to comment a blogpost
  Given I visited "blog page"
  And I follow "Post 2"
  And I wait 5 seconds
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I fill in the following:
    | authorName  | Naruto              |
    | authorEmail | naruto72@gmail.com  |
  When I press "Commenter"
  And I wait 5 seconds
  Then I should see "J'ai un truc à dire" in the ".opinion__list" element

@database @javascript
Scenario: Logged in user wants to comment a blogpost
  Given I am logged in as user
  And I visited "blog page"
  And I follow "Post 2"
  And I wait 5 seconds
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I should not see "Commenter avec mon compte"
  And I should not see "Commenter sans créer de compte"
  When I press "Commenter"
  And I wait 5 seconds
  Then I should see "J'ai un truc à dire" in the ".opinion__list" element

@javascript
Scenario: Anonymous wants to comment a blogpost without email
  Given I visited "blog page"
  And I follow "Post 2"
  And I wait 5 seconds
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I fill in the following:
    | authorName  | Naruto              |
  When I press "Commenter"
  And I wait 5 seconds
  Then I should not see "J'ai un truc à dire" in the ".opinion__list" element

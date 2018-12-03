@core @blog
Feature: Blog

Background:
  Given feature "blog" is enabled

Scenario: Anonymous wants to list published posts
  And I visited "blog page"
  Then I should see 10 ".media--news" elements

@javascript
Scenario: Posts can be filtered by projects
  And I visited "blog page"
  And I select "Croissance, innovation, disruption" from "post_search_project"
  Then I should see 5 ".media--news" elements
  And I should see "Post 5"
  And I should not see "Post 8"

@javascript
Scenario: Post can be filtered by theme
  And feature "themes" is enabled
  And I visited "blog page"
  And I select "Justice" from "post_search_theme"
  And I wait ".media--news" to appear on current page
  Then I should see 8 ".media--news" elements
  And I should see "Post 8"
  And I should not see "Post 2"

@database @javascript
Scenario: Anonymous wants to comment a blogpost
  And I visited "blog article page" with:
    | articleSlug | post-2 |
  And I wait 1 seconds
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I fill in the following:
    | authorName  | Naruto              |
    | authorEmail | naruto72@gmail.com  |
  When I press "comment.submit"
  And I wait 1 seconds
  Then I should see "comment.submit_success" in the "#global-alert-box" element
  And I should see "J'ai un truc à dire" in the ".comments__section" element

@database @javascript
Scenario: Logged in user wants to comment a blogpost
  And I am logged in as user
  And I visited "blog article page" with:
    | articleSlug | post-2 |
  And I wait 1 seconds
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I should not see "comment.with_my_account"
  And I should not see "comment.without_account"
  When I press "comment.submit"
  And I wait 1 seconds
  Then I should see "comment.submit_success" in the "#global-alert-box" element
  Then I should see "J'ai un truc à dire" in the ".comments__section" element

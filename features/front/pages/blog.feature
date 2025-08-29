@core @blog
Feature: Blog

Background:
  Given feature "blog" is enabled

@database
Scenario: Anonymous wants to comment a blogpost
  And I visited "blog article page" with:
    | articleSlug | post-fr-2 |
  And I wait "[name='body']" to appear on current page
  And I fill in the following:
    | body        | J'ai un truc à dire |
    | authorName  | Naruto              |
    | authorEmail | naruto72@gmail.com  |
  When I press "comment.submit"
  Then I should see "comment.submit_success" within 5 seconds in the ".toasts-container--top div" element
  Then I should see "J'ai un truc à dire" within 5 seconds in the ".comments__section" element

@database
Scenario: Anonymous wants to comment a blogpost with moderation enabled
  And feature moderation_comment is enabled
  And I visited "blog article page" with:
    | articleSlug | post-fr-2 |
  And I wait "[name='body']" to appear on current page
  And I fill in the following:
    | body        | J'ai un truc à dire |
    | authorName  | Naruto              |
    | authorEmail | naruto72@gmail.com  |
  When I press "comment.submit"
  Then I should see "confirm-email-address" within 5 seconds in the ".toasts-container--top div" element

@database
Scenario: Logged in user wants to comment a blogpost
  And I am logged in as user
  And I visited "blog article page" with:
    | articleSlug | post-fr-2 |
  And I wait "[name='body']" to appear on current page
  And I fill in the following:
    | body        | J'ai un truc à dire |
  And I should not see "comment.with_my_account"
  And I should not see "comment.without_account"
  When I press "comment.submit"
  Then I should see "comment.submit_success" within 5 seconds in the ".toasts-container--top div" element
  Then I should see "J'ai un truc à dire" within 5 seconds in the ".comments__section" element
